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

    const userId = userRes.rows.length ? userRes.rows[0].userid : null;

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
      (childid, physicianname, middlename, lastname, addressline1, addressline2,
       city, state, country, zipcode, phonetype, phonenumber, alternatephonetype, alternatenumber, countrycode)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      `,
      [
        childId,
        medicalInfo.physicianFirstName || null,
        medicalInfo.physicianMiddleName || null,
        medicalInfo.physicianLastName || null,
        medicalInfo.address1,
        medicalInfo.address2,
        medicalInfo.city,
        medicalInfo.state,
        medicalInfo.country,
        medicalInfo.zipCode,
        medicalInfo.phoneType,
        medicalInfo.phoneNumber,
        medicalInfo.alternatePhoneType || null,
        medicalInfo.alternatePhoneNumber || null,
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
  WHERE programid = $1
  `,
      [enrollmentProgramDetails.programType]
    );

    // Room Type
    const roomRes = await client.query(
      `
  SELECT roomtypeid
  FROM roomtypes
  WHERE roomtypeid = $1
  `,
      [enrollmentProgramDetails.roomType]
    );

    if (!programRes.rows.length || !roomRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Invalid program or room type",
        detail: {
          programType: enrollmentProgramDetails?.programType,
          roomType: enrollmentProgramDetails?.roomType,
        },
      });
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
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "No enrollment plan found for selected program & room",
      });
    }

    // Payment Plan
    const paymentRes = await client.query(
      `
  SELECT paymentplanid
  FROM paymentplan
  WHERE paymentplanid = $1
  `,
      [enrollmentProgramDetails.planType]
    );

    if (!paymentRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Invalid payment plan type",
        detail: { planType: enrollmentProgramDetails?.planType },
      });
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
    const query = `
      SELECT
        c.childid,
        c.firstname AS childFirstName,
        c.middlename AS childMiddleName,
        c.lastname AS childLastName,
        c.gender,
        c.dateofbirth,
        c.placeofbirth,
        g.guardianid,
        g.firstname AS parentFirstName,
        g.middlename AS parentMiddleName,
        g.lastname AS parentLastName,
        g.emailaddress AS parentEmail,
        g.addressline1 AS parentAddressLine1,
        g.addressline2 AS parentAddressLine2,
        g.city AS parentCity,
        g.state AS parentState,
        g.country AS parentCountry,
        g.zipcode AS parentZipCode,
        m.medicalcontactid,
        m.physicianname AS physicianFirstName,
        m.middlename AS physicianMiddleName,
        m.lastname AS physicianLastName,
        m.addressline1 AS medicalAddressLine1,
        m.addressline2 AS medicalAddressLine2,
        m.city AS medicalCity,
        m.state AS medicalState,
        m.country AS medicalCountry,
        m.zipcode AS medicalZipCode,
        m.phonetype AS medicalPhoneType,
        m.phonenumber AS medicalPhoneNumber,
        m.alternatephonetype AS medicalAlternatePhoneType,
        m.alternatenumber AS medicalAlternatePhoneNumber,
        cf.facilityid,
        cf.emergencycontactname,
        cf.emergencyphonenumber,
        cf.addressline1 AS careFacilityAddressLine1,
        cf.addressline2 AS careFacilityAddressLine2,
        cf.city AS careFacilityCity,
        cf.state AS careFacilityState,
        cf.country AS careFacilityCountry,
        cf.zipcode AS careFacilityZipCode
      FROM children c
      LEFT JOIN child_guardians cg ON c.childid = cg.childid AND cg.isprimary = true
      LEFT JOIN guardians g ON cg.guardianid = g.guardianid
      LEFT JOIN medicalcontacts m ON c.childid = m.childid
      LEFT JOIN carefacilities cf ON c.childid = cf.childid
      WHERE c.childid = $1
    `;

    const result = await pool.query(query, [childId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Registration not found" });
    }

    const row = result.rows[0];
    const student = {
      childInfo: {
        childId: row.childid,
        firstName: row.childfirstname,
        middleName: row.childmiddlename,
        lastName: row.childlastname,
        gender: row.gender,
        dateOfBirth: row.dateofbirth,
        placeOfBirth: row.placeofbirth,
      },
      parentGuardianInfo: {
        guardianId: row.guardianid,
        firstName: row.parentfirstname,
        middleName: row.parentmiddlename,
        lastName: row.parentlastname,
        email: row.parentemail,
        address1: row.parentaddressline1,
        address2: row.parentaddressline2,
        city: row.parentcity,
        state: row.parentstate,
        country: row.parentcountry,
        zipCode: row.parentzipcode,
      },
      medicalInfo: {
        medicalContactId: row.medicalcontactid,
        physicianFirstName: row.physicianfirstname,
        physicianMiddleName: row.physicianmiddlename,
        physicianLastName: row.physicianlastname,
        physicianName: [
          row.physicianfirstname,
          row.physicianmiddlename,
          row.physicianlastname,
        ]
          .filter(Boolean)
          .join(" "),
        address1: row.medicaladdressline1,
        address2: row.medicaladdressline2,
        city: row.medicalcity,
        state: row.medicalstate,
        country: row.medicalcountry,
        zipCode: row.medicalzipcode,
        phoneType: row.medicalphonetype,
        phoneNumber: row.medicalphonenumber,
        alternatePhoneType: row.medicalalternatephonetype,
        alternatePhoneNumber: row.medicalalternatephonenumber,
      },
      careFacilityInfo: {
        facilityId: row.facilityid,
        emergencyContactName: row.emergencycontactname,
        emergencyPhoneNumber: row.emergencyphonenumber,
        address1: row.carefacilityaddressline1,
        address2: row.carefacilityaddressline2,
        city: row.carefacilitycity,
        state: row.carefacilitystate,
        country: row.carefacilitycountry,
        zipCode: row.carefacilityzipcode,
      },
    };

    res.json({ success: true, data: student });
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
        SET physicianname=$1, middlename=$2, lastname=$3, addressline1=$4, addressline2=$5, city=$6, state=$7, country=$8,
            zipcode=$9, phonetype=$10, phonenumber=$11, alternatephonetype=$12, alternatenumber=$13
        WHERE childid=$14
        `,
        [
          medicalInfo.physicianFirstName || null,
          medicalInfo.physicianMiddleName || null,
          medicalInfo.physicianLastName || null,
          medicalInfo.address1,
          medicalInfo.address2,
          medicalInfo.city,
          medicalInfo.state,
          medicalInfo.country,
          medicalInfo.zipCode,
          medicalInfo.phoneType,
          medicalInfo.phoneNumber,
          medicalInfo.alternatePhoneType || null,
          medicalInfo.alternatePhoneNumber || null,
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

    // If enrollmentProgramDetails provided, validate and update registrations within same transaction
    if (enrollmentProgramDetails) {
      const { programType, roomType, planType, status } =
        enrollmentProgramDetails;

      // Validate program and room
      const programRes = await client.query(
        `SELECT programid FROM programs WHERE programid = $1`,
        [programType]
      );
      const roomRes = await client.query(
        `SELECT roomtypeid FROM roomtypes WHERE roomtypeid = $1`,
        [roomType]
      );

      if (!programRes.rows.length || !roomRes.rows.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid program or room type" });
      }

      const planRes = await client.query(
        `SELECT enrollmentplanid FROM enrollmentplans WHERE programid = $1 AND roomtypeid = $2`,
        [programRes.rows[0].programid, roomRes.rows[0].roomtypeid]
      );

      if (!planRes.rows.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "No enrollment plan found for selected program & room",
        });
      }

      const paymentRes = await client.query(
        `SELECT paymentplanid FROM paymentplan WHERE paymentplanid = $1`,
        [planType]
      );
      if (!paymentRes.rows.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid payment plan type" });
      }

      // Update or insert registration record
      const regRes = await client.query(
        `SELECT registrationid FROM registrations WHERE childid = $1`,
        [childId]
      );
      if (regRes.rows.length) {
        await client.query(
          `UPDATE registrations SET enrollmentplanid=$1, paymentplanid=$2, status=$3 WHERE childid=$4`,
          [
            planRes.rows[0].enrollmentplanid,
            paymentRes.rows[0].paymentplanid,
            status || "Pending Approval",
            childId,
          ]
        );
      } else {
        await client.query(
          `INSERT INTO registrations (childid, enrollmentplanid, status, paymentplanid, amount) VALUES ($1,$2,$3,$4,0)`,
          [
            childId,
            planRes.rows[0].enrollmentplanid,
            status || "Pending Approval",
            paymentRes.rows[0].paymentplanid,
          ]
        );
      }
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
