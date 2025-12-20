import { pool } from "../db.js";

/**
 * UPDATE STUDENT - Update student information across all tables
 * Accepts: childId and updated data for child, parent, medical, and facility info
 * Updates: children, guardians, medicalcontacts, carefacilities tables
 */
export const updateStudent = async (req, res) => {
  const client = await pool.connect();

  try {
    const { childId } = req.params;
    const { childInfo, parentGuardianInfo, medicalInfo, careFacilityInfo } =
      req.body;

    // Validate childId
    if (!childId) {
      return res.status(400).json({
        success: false,
        error: "childId is required",
      });
    }

    await client.query("BEGIN");

    // 1️ Update CHILD information
    if (childInfo) {
      await client.query(
        `
        UPDATE children
        SET firstname = $1, middlename = $2, lastname = $3, gender = $4,
            dateofbirth = $5, placeofbirth = $6
        WHERE childid = $7
        `,
        [
          childInfo.firstName || null,
          childInfo.middleName || null,
          childInfo.lastName || null,
          childInfo.gender || null,
          childInfo.dateOfBirth || null,
          childInfo.placeOfBirth || null,
          childId,
        ]
      );
    }

    // 2️ Update PARENT/GUARDIAN information
    if (parentGuardianInfo) {
      // First get the guardianid for this child
      const guardianRes = await client.query(
        `
        SELECT g.guardianid FROM guardians g
        JOIN child_guardians cg ON g.guardianid = cg.guardianid
        WHERE cg.childid = $1 AND cg.isprimary = true
        `,
        [childId]
      );

      if (guardianRes.rows.length > 0) {
        const guardianId = guardianRes.rows[0].guardianid;

        await client.query(
          `
          UPDATE guardians
          SET firstname = $1, middlename = $2, lastname = $3, emailaddress = $4,
              addressline1 = $5, addressline2 = $6, city = $7, state = $8,
              country = $9, zipcode = $10, phonetype = $11, phonenumber = $12,
              alternatephonetype = $13, alternatenumber = $14, countrycode = $15,
              alternatecountrycode = $16
          WHERE guardianid = $17
          `,
          [
            parentGuardianInfo.firstName || null,
            parentGuardianInfo.middleName || null,
            parentGuardianInfo.lastName || null,
            parentGuardianInfo.email || null,
            parentGuardianInfo.address1 || null,
            parentGuardianInfo.address2 || null,
            parentGuardianInfo.city || null,
            parentGuardianInfo.state || null,
            parentGuardianInfo.country || null,
            parentGuardianInfo.zipCode || null,
            parentGuardianInfo.phoneType || null,
            parentGuardianInfo.phoneNumber || null,
            parentGuardianInfo.alternatePhoneType || null,
            parentGuardianInfo.alternatePhoneNumber || null,
            parentGuardianInfo.countryCode || "+1",
            parentGuardianInfo.alternateCountryCode || null,
            guardianId,
          ]
        );
      }
    }

    // 3️ Update MEDICAL CONTACT information
    if (medicalInfo) {
      // prefer explicit parts; fall back to splitting full name if necessary
      let first = medicalInfo.physicianFirstName || null;
      let middle = medicalInfo.physicianMiddleName || null;
      let last = medicalInfo.physicianLastName || null;
      if (!first && medicalInfo.physicianName) {
        const parts = medicalInfo.physicianName.trim().split(/\s+/);
        first = parts[0] || null;
        if (parts.length === 2) {
          last = parts[1] || null;
        } else if (parts.length > 2) {
          middle = parts.slice(1, -1).join(" ") || null;
          last = parts.slice(-1)[0] || null;
        }
      }

      await client.query(
        `
        UPDATE medicalcontacts
        SET physicianname = $1, middlename = $2, lastname = $3, addressline1 = $4, addressline2 = $5,
            city = $6, state = $7, country = $8, zipcode = $9,
            phonetype = $10, phonenumber = $11, countrycode = $12
        WHERE childid = $13
        `,
        [
          first,
          middle,
          last,
          medicalInfo.address1 || null,
          medicalInfo.address2 || null,
          medicalInfo.city || null,
          medicalInfo.state || null,
          medicalInfo.country || null,
          medicalInfo.zipCode || null,
          medicalInfo.phoneType || null,
          medicalInfo.phoneNumber || null,
          medicalInfo.countryCode || "+1",
          childId,
        ]
      );
    }

    // 4️ Update CARE FACILITY information
    if (careFacilityInfo) {
      await client.query(
        `
        UPDATE carefacilities
        SET emergencycontactname = $1, emergencyphonenumber = $2,
            addressline1 = $3, addressline2 = $4, city = $5, state = $6,
            country = $7, zipcode = $8, phonetype = $9, countrycode = $10
        WHERE childid = $11
        `,
        [
          careFacilityInfo.emergencyContactName || null,
          careFacilityInfo.emergencyPhoneNumber || null,
          careFacilityInfo.address1 || null,
          careFacilityInfo.address2 || null,
          careFacilityInfo.city || null,
          careFacilityInfo.state || null,
          careFacilityInfo.country || null,
          careFacilityInfo.zipCode || null,
          careFacilityInfo.phoneType || null,
          careFacilityInfo.countryCode || "+1",
          childId,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Student information updated successfully",
      childId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Update failed:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      message: "Failed to update student information",
    });
  } finally {
    client.release();
  }
};

/**
 * GET ALL STUDENTS - Fetches complete student information
 * Returns: Array of students with all their related data
 * Includes: Child info, Parent/Guardian info, Medical info, Care facility info, Enrollment details
 */
export const getAllStudents = async (req, res) => {
  try {
    // Query to fetch all students with their complete information
    const query = `
      SELECT
        -- Child Information
        c.childid,
        c.firstname AS childFirstName,
        c.middlename AS childMiddleName,
        c.lastname AS childLastName,
        c.gender,
        c.dateofbirth,
        c.placeofbirth,
        c.parentuserid,
        
        -- Parent/Guardian Information
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
        g.countrycode AS parentCountryCode,
        g.phonetype AS parentPhoneType,
        g.phonenumber AS parentPhoneNumber,
        g.alternatecountrycode AS parentAlternateCountryCode,
        g.alternatephonetype AS parentAlternatePhoneType,
        g.alternatenumber AS parentAlternatePhoneNumber,
        cg.relationtype AS parentRelationship,
        
        -- Medical Information
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
        m.countrycode AS medicalCountryCode,
        m.phonetype AS medicalPhoneType,
        m.phonenumber AS medicalPhoneNumber,
        
        -- Care Facility Information
        cf.facilityid,
        cf.emergencycontactname,
        cf.emergencyphonenumber,
        cf.addressline1 AS careFacilityAddressLine1,
        cf.addressline2 AS careFacilityAddressLine2,
        cf.city AS careFacilityCity,
        cf.state AS careFacilityState,
        cf.country AS careFacilityCountry,
        cf.zipcode AS careFacilityZipCode,
        cf.countrycode AS careFacilityCountryCode,
        cf.phonetype AS careFacilityPhoneType,
        
        -- Enrollment Information
        r.registrationid,
        r.enrollmentplanid,
        r.status AS enrollmentStatus,
        r.paymentplanid,
        r.amount AS registrationAmount,
        p.programname AS programType,
        rt.roomtype AS roomType,
        pln.plantype AS planType
      FROM
        children c
      LEFT JOIN child_guardians cg ON c.childid = cg.childid AND cg.isprimary = true
      LEFT JOIN guardians g ON cg.guardianid = g.guardianid
      LEFT JOIN medicalcontacts m ON c.childid = m.childid
      LEFT JOIN carefacilities cf ON c.childid = cf.childid
      LEFT JOIN registrations r ON c.childid = r.childid
      LEFT JOIN enrollmentplans ep ON r.enrollmentplanid = ep.enrollmentplanid
      LEFT JOIN programs p ON ep.programid = p.programid
      LEFT JOIN roomtypes rt ON ep.roomtypeid = rt.roomtypeid
      LEFT JOIN paymentplan pln ON r.paymentplanid = pln.paymentplanid
      ORDER BY c.childid DESC
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No students found",
        data: [],
      });
    }

    // Transform flat result into nested structure
    const students = [];
    const studentMap = {};

    result.rows.forEach((row) => {
      const childId = row.childid;

      // Create student object if not exists
      if (!studentMap[childId]) {
        studentMap[childId] = {
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
            countryCode: row.parentcountrycode,
            phoneType: row.parentphonetype,
            phoneNumber: row.parentphonenumber,
            alternateCountryCode: row.parentalternatecountrycode,
            alternatePhoneType: row.parentalternatephonetype,
            alternatePhoneNumber: row.parentalternatephonenumber,
            relationship: row.parentrelationship,
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
            countryCode: row.medicalcountrycode,
            phoneType: row.medicalphonetype,
            phoneNumber: row.medicalphonenumber,
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
            countryCode: row.carefacilitycountrycode,
            phoneType: row.carefacilityphonetype,
          },
          enrollmentProgramDetails: {
            registrationId: row.registrationid,
            enrollmentPlanId: row.enrollmentplanid,
            status: row.enrollmentstatus,
            paymentPlanId: row.paymentplanid,
            amount: row.registrationamount,
            programType: row.programtype,
            roomType: row.roomtype,
            planType: row.plantype,
          },
        };

        students.push(studentMap[childId]);
      }
    });

    return res.status(200).json({
      success: true,
      message: `Successfully retrieved ${students.length} student(s)`,
      totalCount: students.length,
      data: students,
    });
  } catch (error) {
    console.error("❌ Error fetching students:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch students",
    });
  }
};

/**
 * GET STUDENT BY ID - Fetches single student information by childId
 * Returns: Student object with all related data
 */
export const getStudentById = async (req, res) => {
  try {
    const { childId } = req.params;

    const query = `
      SELECT
        -- Child Information
        c.childid,
        c.firstname AS childFirstName,
        c.middlename AS childMiddleName,
        c.lastname AS childLastName,
        c.gender,
        c.dateofbirth,
        c.placeofbirth,
        c.parentuserid,
        
        -- Parent/Guardian Information
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
        g.countrycode AS parentCountryCode,
        g.phonetype AS parentPhoneType,
        g.phonenumber AS parentPhoneNumber,
        g.alternatecountrycode AS parentAlternateCountryCode,
        g.alternatephonetype AS parentAlternatePhoneType,
        g.alternatenumber AS parentAlternatePhoneNumber,
        cg.relationtype AS parentRelationship,
        
        -- Medical Information
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
        m.countrycode AS medicalCountryCode,
        m.phonetype AS medicalPhoneType,
        m.phonenumber AS medicalPhoneNumber,
        
        -- Care Facility Information
        cf.facilityid,
        cf.emergencycontactname,
        cf.emergencyphonenumber,
        cf.addressline1 AS careFacilityAddressLine1,
        cf.addressline2 AS careFacilityAddressLine2,
        cf.city AS careFacilityCity,
        cf.state AS careFacilityState,
        cf.country AS careFacilityCountry,
        cf.zipcode AS careFacilityZipCode,
        cf.countrycode AS careFacilityCountryCode,
        cf.phonetype AS careFacilityPhoneType,
        
        -- Enrollment Information
        r.registrationid,
        r.enrollmentplanid,
        r.status AS enrollmentStatus,
        r.paymentplanid,
        r.amount AS registrationAmount,
        p.programname AS programType,
        rt.roomtype AS roomType,
        pln.plantype AS planType
      FROM
        children c
      LEFT JOIN child_guardians cg ON c.childid = cg.childid AND cg.isprimary = true
      LEFT JOIN guardians g ON cg.guardianid = g.guardianid
      LEFT JOIN medicalcontacts m ON c.childid = m.childid
      LEFT JOIN carefacilities cf ON c.childid = cf.childid
      LEFT JOIN registrations r ON c.childid = r.childid
      LEFT JOIN enrollmentplans ep ON r.enrollmentplanid = ep.enrollmentplanid
      LEFT JOIN programs p ON ep.programid = p.programid
      LEFT JOIN roomtypes rt ON ep.roomtypeid = rt.roomtypeid
      LEFT JOIN paymentplan pln ON r.paymentplanid = pln.paymentplanid
      WHERE c.childid = $1
    `;

    const result = await pool.query(query, [childId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
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
        countryCode: row.parentcountrycode,
        phoneType: row.parentphonetype,
        phoneNumber: row.parentphonenumber,
        alternateCountryCode: row.parentalternatecountrycode,
        alternatePhoneType: row.parentalternatephonetype,
        alternatePhoneNumber: row.parentalternatephonenumber,
        relationship: row.parentrelationship,
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
        countryCode: row.medicalcountrycode,
        phoneType: row.medicalphonetype,
        phoneNumber: row.medicalphonenumber,
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
        countryCode: row.carefacilitycountrycode,
        phoneType: row.carefacilityphonetype,
      },
      enrollmentProgramDetails: {
        registrationId: row.registrationid,
        enrollmentPlanId: row.enrollmentplanid,
        status: row.enrollmentstatus,
        paymentPlanId: row.paymentplanid,
        amount: row.registrationamount,
        programType: row.programtype,
        roomType: row.roomtype,
        planType: row.plantype,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Student retrieved successfully",
      data: student,
    });
  } catch (error) {
    console.error("❌ Error fetching student by ID:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch student",
    });
  }
};
