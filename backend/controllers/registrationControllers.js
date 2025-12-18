import { pool } from "../db.js";

/**
 * CREATE REGISTRATION - Multi-table transaction
 * Inserts child, parent guardian, medical contact, care facility records
 * Returns childId for frontend use
 * On error: rolls back all inserts, returns 400/500 error
 */
export const createRegistration = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      childInfo,
      parentGuardianInfo,
      medicalInfo,
      careFacilityInfo,
      enrollmentProgramDetails,
      email,
    } = req.body;

    await client.query("BEGIN");

    // 1️ Get parent user
    const userRes = await client.query(
      `SELECT userid FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const userId = userRes.rows[0].userid;

    // 2️ Insert CHILD
    const childRes = await client.query(
      `
      INSERT INTO children
      (firstname, middlename, lastname, gender, dateofbirth, placeofbirth, parentuserid)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING childid
      `,
      [
        childInfo.firstName,
        childInfo.middleName,
        childInfo.lastName,
        childInfo.gender,
        childInfo.dateOfBirth,
        childInfo.placeOfBirth,
        userId,
      ]
    );

    const childId = childRes.rows[0].childid;

    // 3️ Guardian
    const guardianRes = await client.query(
      `
      INSERT INTO guardians
      (firstname, middlename, lastname, emailaddress, addressline1, addressline2,
       city, state, country, zipcode, phonetype, phonenumber, alternatephonetype,
       alternatenumber, countrycode)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING guardianid
      `,
      [
        parentGuardianInfo.firstName,
        parentGuardianInfo.middleName,
        parentGuardianInfo.lastName,
        parentGuardianInfo.email,
        parentGuardianInfo.address1,
        parentGuardianInfo.address2,
        parentGuardianInfo.city,
        parentGuardianInfo.state,
        parentGuardianInfo.country,
        parentGuardianInfo.zipCode,
        parentGuardianInfo.phoneType,
        parentGuardianInfo.phoneNumber,
        parentGuardianInfo.alternatePhoneType || null,
        parentGuardianInfo.alternatePhoneNumber || null,
        "+1",
      ]
    );

    const guardianId = guardianRes.rows[0].guardianid;

    await client.query(
      `
      INSERT INTO child_guardians
      (childid, guardianid, relationtype, isprimary)
      VALUES ($1,$2,$3,true)
      `,
      [childId, guardianId, parentGuardianInfo.relationship]
    );

    // 4️ Medical
    await client.query(
      `
      INSERT INTO medicalcontacts
      (childid, physicianname, addressline1, addressline2,
       city, state, country, zipcode, phonetype, phonenumber, countrycode)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `,
      [
        childId,
        `${medicalInfo.physicianFirstName} ${medicalInfo.physicianLastName}`,
        medicalInfo.address1,
        medicalInfo.address2,
        medicalInfo.city,
        medicalInfo.state,
        medicalInfo.country,
        medicalInfo.zipCode,
        medicalInfo.phoneType,
        medicalInfo.phoneNumber,
        "+1",
      ]
    );

    // 5️ Care Facility
    await client.query(
      `
  INSERT INTO carefacilities
  (
    childid,
    emergencycontactname,
    emergencyphonenumber,
    addressline1,
    addressline2,
    city,
    state,
    country,
    zipcode,
    phonetype,
    countrycode
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
  `,
      [
        childId,
        careFacilityInfo.emergencyContactName,
        careFacilityInfo.emergencyPhoneNumber,
        careFacilityInfo.address1,
        careFacilityInfo.address2,
        careFacilityInfo.city,
        careFacilityInfo.state,
        careFacilityInfo.country,
        careFacilityInfo.zipCode,
        careFacilityInfo.phoneType,
        "+1",
      ]
    );

    // 6️ Resolve Program + Room + Plan
    // Program
    const programRes = await client.query(
      `
  SELECT programid
  FROM programs
  WHERE LOWER(programname) = LOWER(TRIM($1))
  `,
      [enrollmentProgramDetails.programType]
    );

    // Room Type
    const roomRes = await client.query(
      `
  SELECT roomtypeid
  FROM roomtypes
  WHERE LOWER(roomtype) = LOWER(TRIM($1))
  `,
      [enrollmentProgramDetails.roomType]
    );

    if (!programRes.rows.length || !roomRes.rows.length) {
      throw new Error("Invalid program or room type");
    }

    // Enrollment Plan (mapping table)
    const planRes = await client.query(
      `
  SELECT enrollmentplanid
  FROM enrollmentplans
  WHERE programid = $1 AND roomtypeid = $2
  `,
      [programRes.rows[0].programid, roomRes.rows[0].roomtypeid]
    );

    if (!planRes.rows.length) {
      throw new Error("No enrollment plan found for selected program & room");
    }

    // Payment Plan
    const paymentRes = await client.query(
      `
  SELECT paymentplanid
  FROM paymentplan
  WHERE LOWER(plantype) = LOWER(TRIM($1))
  `,
      [enrollmentProgramDetails.planType]
    );

    if (!paymentRes.rows.length) {
      throw new Error("Invalid payment plan type");
    }

    // 7️ Registration
    await client.query(
      `
      INSERT INTO registrations
      (childid, enrollmentplanid, status, paymentplanid, amount)
      VALUES ($1,$2,'Pending Approval',$3,0)
      `,
      [
        childId,
        planRes.rows[0].enrollmentplanid,
        paymentRes.rows[0].paymentplanid,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Registration completed successfully",
      childId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Registration failed:", err.message);
    res.status(500).json({ error: err.message, detail: err.detail });
  } finally {
    client.release();
  }
};

/**
 * GET REGISTRATION - Retrieve all registration data for a child
 * Returns child, medical contact, and care facility info
 * Used by edit-registration component to populate the form
 */
export const getRegistrationByChildId = async (req, res) => {
  const { childId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM children c
      LEFT JOIN medicalcontacts m ON m.childid = c.childid
      LEFT JOIN carefacilities cf ON cf.childid = c.childid
      LEFT JOIN child_guardians cg ON cg.childid = c.childid
      LEFT JOIN guardians g ON g.guardianid = cg.guardianid
      WHERE c.childid = $1
      `,
      [childId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Registration not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Failed to fetch registration:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE REGISTRATION - Multi-table transaction
 * Updates child, guardian, medical contact, care facility records
 * Supports partial updates - only provided sections are updated
 * Uses transaction with rollback on error
 */
export const updateRegistration = async (req, res) => {
  const { childId } = req.params;
  const {
    childInfo,
    parentGuardianInfo,
    medicalInfo,
    careFacilityInfo,
    enrollmentProgramDetails,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Update child info
    if (childInfo) {
      await client.query(
        `
        UPDATE children
        SET firstname=$1, middlename=$2, lastname=$3, gender=$4, dateofbirth=$5, placeofbirth=$6
        WHERE childid=$7
        `,
        [
          childInfo.firstName,
          childInfo.middleName,
          childInfo.lastName,
          childInfo.gender,
          childInfo.dateOfBirth,
          childInfo.placeOfBirth,
          childId,
        ]
      );
    }

    // Update parent/guardian info
    if (parentGuardianInfo) {
      // Get the guardian ID for this child
      const guardianRes = await client.query(
        `
        SELECT g.guardianid
        FROM guardians g
        INNER JOIN child_guardians cg ON g.guardianid = cg.guardianid
        WHERE cg.childid = $1
        LIMIT 1
        `,
        [childId]
      );

      if (guardianRes.rows.length === 0) {
        throw new Error("Guardian not found for this child");
      }

      const guardianId = guardianRes.rows[0].guardianid;

      // Update guardian info
      await client.query(
        `
        UPDATE guardians
        SET firstname=$1, middlename=$2, lastname=$3, emailaddress=$4, addressline1=$5, addressline2=$6,
            city=$7, state=$8, country=$9, zipcode=$10, phonetype=$11, phonenumber=$12,
            alternatephonetype=$13, alternatenumber=$14
        WHERE guardianid=$15
        `,
        [
          parentGuardianInfo.firstName,
          parentGuardianInfo.middleName,
          parentGuardianInfo.lastName,
          parentGuardianInfo.email,
          parentGuardianInfo.address1,
          parentGuardianInfo.address2,
          parentGuardianInfo.city,
          parentGuardianInfo.state,
          parentGuardianInfo.country,
          parentGuardianInfo.zipCode,
          parentGuardianInfo.phoneType,
          parentGuardianInfo.phoneNumber,
          parentGuardianInfo.alternatePhoneType || null,
          parentGuardianInfo.alternatePhoneNumber || null,
          guardianId,
        ]
      );

      // Update relationship in child_guardians mapping table if provided
      if (parentGuardianInfo.relationship) {
        await client.query(
          `
          UPDATE child_guardians
          SET relationtype=$1
          WHERE childid=$2 AND guardianid=$3
          `,
          [parentGuardianInfo.relationship, childId, guardianId]
        );
      }
    }

    // Update medical info
    if (medicalInfo) {
      await client.query(
        `
        UPDATE medicalcontacts
        SET physicianname=$1, addressline1=$2, addressline2=$3, city=$4, state=$5, country=$6,
            zipcode=$7, phonetype=$8, phonenumber=$9
        WHERE childid=$10
        `,
        [
          `${medicalInfo.physicianFirstName} ${medicalInfo.physicianLastName}`,
          medicalInfo.address1,
          medicalInfo.address2,
          medicalInfo.city,
          medicalInfo.state,
          medicalInfo.country,
          medicalInfo.zipCode,
          medicalInfo.phoneType,
          medicalInfo.phoneNumber,
          childId,
        ]
      );
    }

    // Update care facility info
    if (careFacilityInfo) {
      await client.query(
        `
        UPDATE carefacilities
        SET emergencycontactname=$1, emergencyphonenumber=$2, addressline1=$3, addressline2=$4,
            city=$5, state=$6, country=$7, zipcode=$8, phonetype=$9
        WHERE childid=$10
        `,
        [
          careFacilityInfo.emergencyContactName,
          careFacilityInfo.emergencyPhoneNumber,
          careFacilityInfo.address1,
          careFacilityInfo.address2,
          careFacilityInfo.city,
          careFacilityInfo.state,
          careFacilityInfo.country,
          careFacilityInfo.zipCode,
          careFacilityInfo.phoneType,
          childId,
        ]
      );
    }

    await client.query("COMMIT");

    res.json({ success: true, message: "Registration updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Update registration failed:", err.message);
    res.status(500).json({ error: err.message, detail: err.detail });
  } finally {
    client.release();
  }
};
