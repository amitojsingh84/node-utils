export const Queries = {     
	getHospitalByPosTid			 		       : `SELECT yhp.id AS id, yhp.hospital_id AS hospitalId, h.display_name AS
	                                      hospitalDisplayName FROM yap_hospital_pos yhp JOIN hospital h ON
																				h.id = yhp.hospital_id WHERE yhp.pos_tid = ? AND h.active = 1 AND
																				yhp.active = 1`,

	getHospitalByDisplayName 		       : `SELECT id FROM hospital WHERE display_name = ? and active = 1 LIMIT 1;`,

	getHospitalUserByDisplayName       : `SELECT h.id as hospitalId, h.user_id as userId, h.primary_contact_number as 
																				mobile, u.email as email from hospital h JOIN user u ON h.user_id = u.id 
																				WHERE h.display_name = ? and h.active = 1 and u.active = 1 LIMIT 1`,

  getHospitalByDisplayNames 		     : `SELECT id FROM hospital WHERE display_name IN (?) and active = 1`,

	searchHospitalByDisplayName 		   : `SELECT id FROM hospital WHERE display_name LIKE ? and active = 1;`,

	getLoyaltyBenefitOffering					 : `SELECT DISTINCT type, benefit_percent, single_txn_amount_limit, benefit_amount, 
																				ap_commission_percent FROM loyalty_benefit_offering
																				WHERE yap_hospital_pos_id IS NULL AND hospital_id = ? AND
																				type IN ('OPD', 'PHARMACY', 'LAB_TEST');`,

  getLoyaltyBenefitOfferingByYapId   : `SELECT id FROM loyalty_benefit_offering WHERE yap_hospital_pos_id IN (?);`,

	getActiveYapHospPos                : `SELECT id, hospital_id AS hospitalId, pos_tid AS posTid FROM yap_hospital_pos
	                                      WHERE active = 1 AND pos_type = 'POS' ORDER BY created DESC;`,

  getUser                  		       : `select id from user where email = ? and active = 1 LIMIT 1`,

	getUserType                  		   : `select id, type from user where email = ? and active = 1 LIMIT 1`,

	getCouponInventory                 : `select id, coupon_code, active, created from coupon_inventory where 1=1`,

	getCouponInventory1			           : `select (select count(1) from coupon_inventory`,
	getCouponInventory2                : `) as total, id, coupon_code, active, created from coupon_inventory`,

	getHospitalCoupons1					       : `select (select count(1) as count from coupon_inventory_hospital_mapping m
	                                      JOIN coupon_inventory ci ON m.coupon_inventory_id=ci.id`,
	getHospitalCoupons2								 : `) as total, m.id as mappingId, m.coupon_inventory_id as couponId,
																				ci.coupon_code as name, m.coupon_usage as couponUsage, m.addition_information 
																				as additionInfo, m.active as status, m.validity_from AS validityFrom, 
																				m.validity_to AS validityTo, h.display_name as hospitalDisplayName
																				from coupon_inventory_hospital_mapping m, coupon_inventory ci, hospital h 
																				where m.coupon_inventory_id = ci.id and h.id = m.hospital_id and h.active = 1`,

	selectWalletWithCustomer           : `SELECT w.id id, w.customer_id customerId, c.mobile mobile, w.wallet_serial 
																				walletSerial, w.hospital_id hospitalId FROM wallet w JOIN customer c ON 
																				c.id = w.customer_id WHERE`,
	
	selectCouponInventoryHospMap			 : `SELECT id, coupon_usage, active, validity_to FROM coupon_inventory_hospital_mapping
																				WHERE hospital_id = ? AND active = 1;`,
																				
	activeCouponInventoryHospMap       : `SELECT id AS mappingId, coupon_inventory_id AS couponId, addition_information AS
	                                      additionInfo FROM coupon_inventory_hospital_mapping WHERE hospital_id = ? AND
	                                      active = 1 ORDER BY updated DESC;`,

	getPatientHospitalLead					   : `SELECT id, comments FROM patient_hospital_lead WHERE lead_type = 'HOSPITAL'
																			  AND lead_hospital_id IS NULL;`,

	selectCouponInventoryWithHospMap   : `select ci.coupon_code as couponCode from coupon_inventory_hospital_mapping hm 
																				JOIN coupon_inventory ci ON	ci.id  = hm.coupon_inventory_id where ?`,
	
	getWalletHistory				 					 : `select wh.id as id, wh.wallet_id as walletId, wh.amount as amount, 
																				wh.mode_of_payment as modeOfPayment, wh.transaction_id as transactionId,
																				wh.reversed_wh_id as reversedWhId, w.wallet_balance as walletBalance from 
																				wallet_history wh JOIN wallet w ON wh.wallet_id = w.id where wh.id = ? LIMIT 1`,

	getOtpList1                        : `SELECT (SELECT count(1) FROM otp_plan`,
	getOtpList2                        : `) as total, mobile, email, otp, created FROM otp_plan`,

	getLoyaltyBenefitOfferings 	 			 : `SELECT id, hospital_id, type, yap_hospital_pos_id as yapId
																				FROM loyalty_benefit_offering WHERE id IN (?);`,

	getWalletHistoryId                 : `SELECT id FROM wallet_history WHERE
																				wallet_id = ? AND transaction_id = ? LIMIT 1;`,

	getWalletByWalletSerial            : `SELECT w.id AS walletId, w.customer_id AS customerId, c.mobile AS mobile,
																				u.email AS email, w.hospital_id AS hospitalId, w.type AS type, c.user_id
																				AS userId, w.entity_id AS entityId FROM wallet w JOIN customer c ON 
																				c.id = w.customer_id JOIN user u ON u.id = c.user_id WHERE w.wallet_serial = ? 
																				LIMIT 1;`,

	getWalletByCustomerId              : `SELECT w.id AS walletId, w.wallet_serial AS wallerSerial,
																				w.customer_id AS customerId, c.mobile AS mobile, u.email AS email,
																				w.hospital_id AS hospitalId, w.type, c.user_id as userId FROM wallet w
																				JOIN customer c ON c.id = w.customer_id JOIN user u ON u.id = c.user_id
																				WHERE w.customer_id = ?;`,

	getWalletByWalletId            		 : `SELECT w.id AS walletId, w.wallet_serial AS walletSerial, c.id AS customerId,
																				c.name AS customerName, c.mobile AS mobile, w.hospital_id as hospitalId,
																				w.type AS type, c.user_id AS userId FROM wallet w
																				JOIN customer c ON c.id = w.customer_id WHERE w.id = ? LIMIT 1;`,

	getPatientHospitalLeads						 : `SELECT id, json_data, hospital_type FROM patient_hospital_lead
																				WHERE lead_hospital_id = ?;`,

	getHospitalNetworkMappingData      : `select id, node_hospital_id as node, edge_hospital_id as edge, created from 
																				hospital_network_mapping where active = 1`,
															
	getHospitalById                    : `SELECT h.id, h.display_name, h.primary_contact_number, h.cgst_rate, h.sgst_rate,
																				h.tds_rate, u.email FROM hospital h, user u WHERE h.id IN (?) AND h.active = 1
																				AND h.user_id = u.id;`,

	getHospitalClaimAmount             : `select SUM(amount) as totalClaim from hospital_claim where active = 1
																				and wallet_id = ?`,

	getNodeEdgePairByNetMapId          : `select id, node_hospital_id as node, edge_hospital_id as edge, active from 
																				hospital_network_mapping where id in (?) and active = 1`,
	
	getNodeEdgePairByNodeEdgeId        : `select id, node_hospital_id as node, edge_hospital_id as edge 
																				from hospital_network_mapping where node_hospital_id in	(?) and 
																				edge_hospital_id in (?) and active = 1`,
       
	getKitMapping                      : `SELECT * FROM hospital_kit_amount_mapping WHERE active = 1 AND
	                                      hospital_id = ?;`,

	getCouponCode                      : `SELECT coupon_code AS couponCode FROM coupon_inventory WHERE id in (?);`,

	getCouponsFromHosMap       			   : `SELECT * FROM coupon_inventory_hospital_mapping WHERE hospital_id = ? AND
	                                      coupon_inventory_id = ?`,

	getEmailTemplates1                 : `SELECT (select count(1) FROM email_metadata`,
	getEmailTemplates2                 : `) as total, id, template_name, subject, cc, email_to, bcc, enabled 
																		  	FROM email_metadata`,

	getTemplateByTemplateName          : `SELECT * FROM email_metadata WHERE template_name = ? LIMIT 1;`,

	getTemplateById										 : `SELECT enabled FROM email_metadata WHERE id IN (?)`,

	getCouponInventoryMappingWallets   : `SELECT DISTINCT wallet_id FROM coupon_inventory_hospital_entity_mapping
																				WHERE active = 1;`,

	getCouponInventroryMappings				 : `SELECT id, coupon_inventory_hospital_mapping_id
																				FROM coupon_inventory_hospital_entity_mapping
																				WHERE active = 1 AND wallet_id = ? ORDER BY created;`,
																				
	getSlowProcesses                   : `SELECT id, info, command, time FROM information_schema.processlist
																				WHERE command <> 'Sleep' AND command <> 'Binlog Dump' AND command <> 'Daemon'
																				AND time >= 5 ORDER BY time DESC;`,

	getSlowQueries                     : `SELECT (SELECT count(1) FROM slow_queries_audit WHERE created > ? AND created < ?)
																				AS count, id, process_id, info, command, time, created, updated 
																				FROM slow_queries_audit WHERE created > ? AND created < ?
																				ORDER BY time DESC`,

  getSlowQueryByProcessId            : `SELECT id FROM slow_queries_audit WHERE process_id = ?;`,

	getKitInventoryForKitNumber				 : `SELECT id FROM kit_inventory WHERE kit_number = ?;`,

	getPickupDepositDetails            : `SELECT pds.id AS id, wh.mode_of_payment as modeOfPayment, wh.amount as amount, 
																				pd.id AS pickupDepositId, pds.deposit_date AS depositDate, pds.active as status
																				FROM pickup_deposit pd JOIN pickup_deposit_status pds ON pd.id = 
																				pds.pickup_deposit_id JOIN wallet_history wh ON wh.id = pd.wallet_history_id
																				WHERE pd.wallet_history_id = ? AND pds.deposit_status='DEPOSIT_COMPLETED'
																				LIMIT 1;`,
																				
	getHospitalIds                     : 'select id from hospital where active = 1',

  getAlreadyMappedHospitalIds        : `select hospital_id from hospital_insurance_vendor_mapping where active = 1`,

  getInsuranceVendorDetails          : `select id, insurance_vendor_id as insuranceVendorId from 
                                        hospital_insurance_vendor_mapping where active = 1 and hospital_id = ? 
                                        LIMIT 1`,

  getHospMapWithDiffVendor           : `select id from hospital_insurance_vendor_mapping where active =1 and 
                                        insurance_vendor_id <> ?`,

	getInsVendorIds                    : `SELECT id FROM insurance_vendor WHERE active = 1`,
	
  getBounusCashMapping               : `SELECT cihm.id AS mappingId, ci.coupon_code AS couponCode, 
																				cihm.addition_information AS additionInfo, cihm.coupon_usage AS couponUsage FROM
																				coupon_inventory_hospital_mapping cihm JOIN coupon_inventory ci ON 
																				cihm.coupon_inventory_id = ci.id WHERE ci.coupon_code = 'Bonus Cash' AND
																				ci.active = 1 AND cihm.active = ? AND cihm.hospital_id = ? LIMIT 1;`,

	getCouponId                        : `SELECT id, active FROM coupon_inventory WHERE coupon_code = ? LIMIT 1`,

	getCouponMappingsByMappingId       : `SELECT hm.id AS mappingId, hm.hospital_id AS hospitalId, hm.active as status,
	                                      hm.coupon_inventory_id AS couponId, ci.coupon_code AS couponCode,
																				hm.addition_information AS additionInfo, hm.validity_from AS validityFrom, 
																				hm.validity_to AS validityTo FROM coupon_inventory_hospital_mapping hm JOIN 
																				coupon_inventory ci ON ci.id = hm.coupon_inventory_id WHERE hm.id IN(?);`,

	getActiveCouponMappingsByMappingId : `SELECT hm.id AS mappingId, hm.hospital_id AS hospitalId, hm.active as status,
																				hm.coupon_inventory_id AS couponId, ci.coupon_code AS couponCode,
																				hm.addition_information AS additionInfo FROM coupon_inventory_hospital_mapping
																				hm JOIN coupon_inventory ci ON ci.id = hm.coupon_inventory_id WHERE hm.id IN
																				(?) AND hm.active = 1;`,

	getCouponMappingDetails            : `SELECT id as mappingId FROM coupon_inventory_hospital_mapping WHERE
	                                      coupon_inventory_id = ? AND active = ? AND hospital_id = ? AND id <> ?`,
																				
	getActiveEmployeeDetails           : `SELECT e.id AS 'Employee Id', e.name AS 'Name', 
																				e.employee_code AS 'Employee Code', e.mobile AS 'Mobile Number', 
																				u.email AS 'Email' FROM employee e JOIN user u 
																				ON u.id = e.user_id WHERE u.active = 1 ORDER BY e.id`,

	getUserIdByEmailAndType            : `SELECT id, active FROM user WHERE email = ? AND type = ? LIMIT 1;`,

	getUserDetailsByParam              : `SELECT * from ?? WHERE ?? = ?`,

	getEmailFromPatHosLeadByMobNo      : `SELECT email from patient_hospital_lead WHERE mobile_number = ?`,

	getLoyaltyBenefitOfferingByHosId   : `select * from loyalty_benefit_offering where active = 1 
																				and hospital_id = ? ORDER BY yap_hospital_pos_id, created`,

	getLoyaltyBenefitOffByHosIdAndType : `select id from loyalty_benefit_offering where active = 1 
																				and hospital_id = ? and type = ? Limit 1`,
																				
	getLoyaltyBeneOffForNullYapPosId   : `select id, type from loyalty_benefit_offering where yap_hospital_pos_id is NULL 
																			  and active = 1 and hospital_id = ? ORDER BY created DESC`,

	getActiveHospitalEmails        		 : `select h.id as id, h.user_id as userId, u.email as email from hospital h 
																				JOIN user u ON h.user_id = u.id where h.active = 1`,
	 
	getEmailToFromHosWorkEmailByHosId  : `select id, email_to from hospital_working_email where hospital_id = ? Limit 1`,
	
	getAllHospitals                    : `SELECT id, product_type FROM hospital WHERE active = 1;`,
	
	getEmailToAndCcFromHospWorkEmail   : `SELECT email_to AS emails, cc FROM hospital_working_email WHERE hospital_id = ? 
																				LIMIT 1`,
	
	getIdFromHospWorkEmail             : `SELECT id FROM hospital_working_email WHERE hospital_id = ? LIMIT 1`,

	getUserByMobileAndType             : `SELECT pu.id AS particularUserId, u.email AS email FROM user u JOIN ?? pu ON
	                                      u.id = pu.user_id WHERE pu.?? = ? AND u.active = 1 LIMIT 1;`,
																				
	getEmailToAndCc                    : `SELECT id, email_to, cc from hospital_working_email where email_to LIKE ? or 
																				cc LIKE ?`,
																				
	getHospitalIdByUserId              : `select id from hospital where active = 1 and user_id = ? Limit 1`,

	getDigitalCommunicationByEmails    : `select id, emails, soc_report_to_emails, soc_report_cc_emails 
																				from digital_communication where emails LIKE ? or 
																				soc_report_to_emails LIKE ? or soc_report_cc_emails LIKE ?`,
	
	getEmailMetadata              		 : `select id, email_to, cc, bcc from email_metadata where email_to LIKE ? or 
																				cc LIKE ? or bcc LIKE ?`,

	getMobilesFromDigitalCommunication : `select id, mobiles from digital_communication where mobiles LIKE ?`,

	getFullLboById                     : `SELECT * from loyalty_benefit_offering where id IN (?)`,
	 
	getActiveLboByIds                  : `SELECT * FROM loyalty_benefit_offering WHERE active = 1 and id IN (?)`,
	
	getEmailFromPatHosLead          	 : `select id from patient_hospital_lead where email = ?`,

	getUserEmailFromSubHosUserLead     : `select id from sub_hospital_user_lead where email = ?`,
	
	getEmailToFromHospWorkEmail        : `select id, email_to from hospital_working_email where hospital_id = ?	limit 1`,

	getPatientHosLead                  : `select id, email, mobile_number from patient_hospital_lead where 
																				lead_hospital_id = ? limit 1`,
	
	getDigitalCommunication            : `select id, emails, soc_report_to_emails, mobiles from digital_communication 
																				where hospital_id = ? limit 1`,

	getMobileFromHospital              : `select id from hospital where primary_contact_number = ? 
																				and active = 1 limit 1`,

	getMobileFromPatHosLead            : `select id from patient_hospital_lead where mobile_number = ? limit 1`,

	getUserFromSubHosUserLead          : `select id from sub_hospital_user_lead where mobile = ? limit 1`,

	getAllUser                  		   : `select id from user where email = ?`,

	getInsuranceCustomerByCustomerId   : `SELECT * FROM insurance_customer WHERE customer_id = ?`,
	
	getActiveKitTypes                  : `SELECT id AS mappingId, kit_type AS kitType, amount, hospital_id AS hospitalId
																				FROM hospital_kit_amount_mapping WHERE active = 1 AND hospital_id = ?`,

	getKitInventoryByCusId             : `SELECT hp.hospital_id AS hospitalId, ki.id AS kitInventoryId, ki.amount AS 
	                                      paidAmount, ki.mode_of_payment AS modeOfPayment, hp.id AS hospitalPickUpId,
																				ki.yesbank_customer_registration_id AS yesbankCusRegId, hp.status AS 
																				hospitalPickUpStatus, hp.amount_to_collect AS hospitalPickupAmount FROM 
																				kit_inventory ki, hospital_pickup hp where ki.id = hp.kit_inventory_id AND 
																				ki.active = 1 AND ki.customer_id = ? OR yesbank_customer_registration_id = ?`,

	getCityById                        : `SELECT * FROM city WHERE id = ? LIMIT 1;`,

	getLocation1                       : `SELECT (SELECT COUNT(1) FROM location l JOIN city c ON l.city_id = c.id JOIN 
																				state s ON s.id = c.state_id `,

	getLocation2                       : `) as count, l.id, l.location_name, l.pincode, l.city_id, l.area, 
																				l.loan_available, s.state_name, c.city_name
																				FROM location l JOIN city c ON l.city_id = c.id JOIN 
																				state s ON s.id = c.state_id `,

	getCity1                       		 : `SELECT (SELECT COUNT(1) FROM city c JOIN state s ON c.state_id = s.id `,

	getCity2                            : `) as count, c.id, c.city_name AS cityName, 
																				c.delivery_available AS deliveryAvailable, s.state_name AS stateName
																				FROM city c JOIN state s ON c.state_id = s.id`,

	getLocationDetails                 : `SELECT l.pincode AS pincode, c.city_name AS city, s.state_name AS state FROM
	                                      location l JOIN city c ON l.city_id = c.id JOIN state s ON c.state_id = s.id
																				WHERE l.id = ? LIMIT 1;`,

	getHospKitAmountMapping            : `SELECT id AS mappingId, amount FROM hospital_kit_amount_mapping WHERE 
																				hospital_id = ?	AND kit_type = ? AND active = 1 Limit 1`,

	displayNameExists                  : `SELECT 1 FROM ?? WHERE display_name = ?;`,

	getSpecializations                 : `SELECT id, name, icon_url AS logoUrl FROM specialization`,

	getNonLoyaltyHospitals             : `SELECT display_name FROM hospital WHERE product_type NOT LIKE '%LOYALTY%' AND 
	                                      active = 1`,

	getSubHospitalUsers                : `SELECT shu.id AS id, shu.name AS name, shu.mobile AS mobile, u.email AS email
	                                      FROM sub_hospital_user shu JOIN user u ON shu.user_id = u.id WHERE u.active = 1
																				AND shu.hospital_id = ?;`,

	getSubHospitalUsersById            : `SELECT * from user u JOIN sub_hospital_user shu ON u.id = shu.user_id WHERE
	                                      shu.id = ? AND u.active = 1 LIMIT 1;`,

  getDigitalCommBySubHospUserId      : `SELECT * FROM digital_communication WHERE sub_hospital_user_id = ?`,

	getLocation                        : `SELECT * FROM location `,

	getStateById                       : `SELECT * FROM state WHERE id = ? LIMIT 1;`,
	
	getUserByParam                     : `SELECT t.user_id AS userId from ?? t join user u on t.user_id = u.id where 
																				u.active = 1 `,

	getCity                            : `SELECT * FROM city`,
	
	getCityByCityName                  : `SELECT * FROM city WHERE city_name = ? AND state_id = ?`,

	getCitiesForState                  : `SELECT id, city_name AS cityName FROM city WHERE state_id = ?;`,

	getLocationById                    : `SELECT * FROM location WHERE id = ?`,

	getTypeFromLoyaltyBenefitOffering  : `SELECT id, type FROM loyalty_benefit_offering WHERE active = 1`,

	getActiveCustomers                 : `SELECT id FROM customer WHERE active = 1`,   
	
	getCustomerVerificationDocs        : `SELECT id FROM customer_verification_docs where customer_id = ? 
																				ORDER BY updated DESC`,

	getMerchants											 : `SELECT u.id AS user_id, u.type AS type, r.id AS role_id, u.email AS email,
	                                      u.active AS active, urm.created AS created, urm.updated AS updated
																				from user u JOIN user_roles_mapping urm ON u.id = urm.user_id 
	                                      JOIN role r ON urm.role_id = r.id WHERE r.name = 'MERCHANT'`,							

	getUserByIdRoleAndType             : `SELECT u.id AS userId, u.type AS type, r.id AS roleId from user u 
	                                      JOIN user_roles_mapping urm ON u.id = urm.user_id JOIN role r 
																				ON urm.role_id = r.id WHERE u.id = ? AND r.name = ? AND u.type = ? LIMIT 1`,

  getHospitalMappings                : `SELECT hum.id AS id, h.id AS hospitalId, h.display_name AS name
                                        from hospital_user_mapping hum JOIN hospital h ON hum.hospital_id = h.id
                                        WHERE hum.user_id = ? AND hum.active = 1 AND hum.role = 'MERCHANT'`,

	getTableId 										 		 : `SELECT id FROM ?? where user_id = ?`,
	
	getProductTypeOfHospitals          : `SELECT id, product_type AS productType FROM hospital WHERE id IN (?)`,

  getLabTestRequestQuery1            : `SELECT (SELECT count(1) FROM 
                                        wallet_lab_test_request wltr JOIN wallet_lab_test_request_status wltrs ON 
                                        wltrs.wallet_lab_test_request_id = wltr.id JOIN wallet w ON 
                                        wltr.wallet_id = w.id JOIN hospital h ON h.id = w.hospital_id JOIN customer c 
                                        ON w.customer_id = c.id JOIN user u ON c.user_id = u.id JOIN location l ON 
                                        l.id = wltr.location_id JOIN city ci ON l.city_id = ci.id JOIN state s ON 
                                        s.id = ci.state_id`,
 getLabTestRequestQuery2             : `) AS total, wltr.id AS id, w.wallet_serial AS walletSerial, c.mobile AS mobile, 
                                        u.email AS email, h.display_name AS hospitalDisplayName, wltr.address AS 
                                        address, wltr.appointment_time AS appointmentTs, wltr.created AS createTs, 
                                        wltrs.status AS status, wltrs.remarks AS remarks, l.pincode AS pincode, 
																				l.area AS area, ci.city_name AS city, s.state_name AS state, c.name AS 
                                        customerName, wltr.amount AS amount, wltr.transaction_id AS transactionId, 
																				wltr.mode_of_payment AS modeOfPayment, wltr.transaction_date AS transactionDate,
																			  wltr.wallet_history_id AS walletHistoryId FROM wallet_lab_test_request wltr JOIN
                                        wallet_lab_test_request_status wltrs ON 
                                        wltrs.wallet_lab_test_request_id = wltr.id JOIN wallet w ON 
                                        wltr.wallet_id = w.id JOIN hospital h ON h.id = w.hospital_id JOIN customer c 
                                        ON w.customer_id = c.id JOIN user u ON c.user_id = u.id JOIN location l ON 
																				l.id = wltr.location_id JOIN city ci ON l.city_id = ci.id JOIN state s ON 
																				s.id = ci.state_id`,

	getLabTestRequestStatus            : `SELECT wltr.wallet_id AS walletId, wltrs.id, wltrs.status
																				FROM wallet_lab_test_request wltr, wallet_lab_test_request_status wltrs
																				WHERE wltr.id = ? AND wltr.active = 1 AND
																				wltrs.wallet_lab_test_request_id = wltr.id AND wltrs.active = 1
																				ORDER BY wltrs.created DESC LIMIT 1;`,

	getHospitalProductType             : `SELECT id, product_type AS productType FROM hospital WHERE id = ?`,

	getCustomerDeviceToken						 : `SELECT dum.device_id AS deviceId, dtm.token AS token
																				FROM device_user_mapping dum, device_token_mapping dtm
																				WHERE dum.entity_type = 'CUSTOMER' AND dum.entity_id = ?
																				AND dtm.device_user_mapping_id = dum.id AND dum.active = 1 AND dtm.active = 1;`,

  getKitTypeFromInventory            : `SELECT hkam.id AS kitTypeId, hkam.kit_type AS kitType, hkam.amount, 
	                                      hkam.hospital_id AS hospitalId, ki.id AS kitInventoryId, ki.amount AS 
																				paidAmount, ki.mode_of_payment AS modeOfPayment, hp.id AS hospitalPickUpId, 
																				hp.status AS hospitalPickUpStatus, hp.amount_to_collect AS hospitalPickupAmount,
																				ki.yesbank_customer_registration_id AS yesbankCusRegId FROM kit_inventory ki, 
																				hospital_kit_amount_mapping hkam, hospital_pickup hp WHERE ki.customer_id = ? 
																				AND hkam.id = ki.hospital_kit_amount_mapping_id AND hp.kit_inventory_id = ki.id;`,

  getKitTypeFromYesCusReg            : `SELECT hkam.id AS kitTypeId, hkam.kit_type AS kitType, hkam.amount, 
	                                      hkam.hospital_id AS hospitalId, ki.id AS kitInventoryId, ki.amount AS 
																				paidAmount, ki.mode_of_payment AS modeOfPayment, hp.id AS hospitalPickUpId, 
																				hp.status AS hospitalPickUpStatus, hp.amount_to_collect AS hospitalPickupAmount, 
                                        ycr.id AS yesbankCusRegId FROM kit_inventory ki, yesbank_customer_registration  
																				ycr, hospital_kit_amount_mapping hkam, hospital_pickup hp WHERE  
																				ycr.customer_id = ? AND ki.yesbank_customer_registration_id = ycr.id AND 
																				hp.kit_inventory_id = ki.id AND hkam.id = ki.hospital_kit_amount_mapping_id;`,

  getKitTypeFromHospitalMapping      : `SELECT hkam.id AS kitTypeId, hkam.kit_type AS kitType, hkam.amount, 
                                        hkam.hospital_id AS hospitalId, ycr.id AS yesbankCusRegId FROM 
																				yesbank_customer_registration ycr, hospital_kit_amount_mapping hkam WHERE 
																				ycr.customer_id = ? AND hkam.id = ycr.hospital_kit_amount_mapping_id;`,

	getHospitalPickupIds               : `SELECT id FROM hospital_pickup WHERE wallet_id = ? OR kit_inventory_id = ? AND 
																				status = 'OPEN'`,

	getSpecializationsByIds            : `SELECT id, name FROM specialization WHERE id IN (?)`,

	getSpecializationMappings          : `SELECT id, specialization_id AS specializationId FROM 
																				hospital_specialization_mapping WHERE hospital_id = ? AND active = 1`,

	getPatientHosLeadSpecMap           : `SELECT s.id AS specializationId FROM 
																				patient_hospital_lead_specialization_mapping ps JOIN specialization s ON 
																				s.name = ps.specialization WHERE ps.patient_hospital_lead_id = ?`,

	getHospitalDisplayNameByIds        : `SELECT display_name displayName FROM hospital WHERE id IN (?)`,

	getEmployeeNameByUserId            : `SELECT name FROM employee WHERE user_id = ? LIMIT 1`,

	getFullHospitalById                : `SELECT * FROM hospital WHERE id = ?`,

	getBonusCashFromHospById           : `SELECT bonus_cash FROM hospital WHERE id = ?`,

	getAddInfoFromBonusCashMapping     : `SELECT cihm.addition_information AS additionInfo FROM
	                                      coupon_inventory_hospital_mapping cihm JOIN coupon_inventory ci ON 
	                                      cihm.coupon_inventory_id = ci.id WHERE ci.coupon_code = 'Bonus Cash' AND
	                                      ci.active = 1 AND cihm.active = ? AND cihm.hospital_id = ? LIMIT 1;`,
	
	getEnum                            : `SELECT enum_value enumValue FROM enum_store WHERE enum_key = ?`,

	getInvoiceNumber                   : `SELECT invoice_number invoiceNumber FROM card_order_request WHERE 
																				issuing_partner = 'YESBANK' ORDER BY approved_on DESC LIMIT 1`,

	getOfficeHubNames									 : `SELECT hub_name hubName FROM happay_address WHERE type = 'OFFICE' AND 
	                                      active = 1`,

	getKitNumberCount                  : `SELECT COUNT(1) AS total FROM kit_inventory WHERE kit_number IN (?)`,

	getMediaGroupQuery1                : `SELECT (SELECT count(*) FROM media_group`,

	getMediaGroupQuery2                : `) AS total, id, name, logo_url, active, created FROM media_group`,

	getArticleQuery1                   : `SELECT (SELECT count(*) FROM article a JOIN media_group mg 
																				ON mg.id = a.media_group_id`,
   
	getArticleQuery2                   : `) AS total, a.id AS id, mg.name AS mediaGroupName, mg.logo_url AS logoUrl, 
																				a.title AS title, a.subtitle, a.link, a.active, a.release_date AS releaseDate, 
																				a.created FROM article a JOIN media_group mg ON mg.id = a.media_group_id`,

	getMediaGroup                      : `SELECT * FROM media_group`,

	getArticles                        : `SELECT * FROM article`,

	getWalletCouponsQuery              : `SELECT cihem.id AS mappingId, cihem.coupon_inventory_hospital_mapping_id AS 
	                                      hospitalCouponId, cihem.total_coupon_usage AS totalUsage, 
																				cihem.coupon_usage_left AS usageLeft, cihem.validity_from AS validityFrom, 
																				cihem.validity_to AS validityTo, cihem.updated AS updateTs, cihem.active AS 
																				status, cihm.coupon_inventory_id AS couponId, cihm.addition_information AS 
																				additionInfo, ci.coupon_code AS couponName FROM 
																				coupon_inventory_hospital_entity_mapping cihem JOIN 
																				coupon_inventory_hospital_mapping cihm ON 
																				cihem.coupon_inventory_hospital_mapping_id = cihm.id JOIN wallet w ON 
																				cihem.wallet_id = w.id JOIN coupon_inventory ci ON 
																				cihm.coupon_inventory_id = ci.id JOIN customer c ON w.customer_id = c.id JOIN 
																				user u ON c.user_id = u.id JOIN hospital h ON w.hospital_id = h.id`,

	getIdByWalletSerial                : `SELECT id FROM wallet WHERE wallet_serial = ?`,

	getCouponMapping                   : `SELECT id, coupon_usage, active FROM coupon_inventory_hospital_mapping
	                                      WHERE hospital_id = ? AND id = ? AND active = 1;`,

	getRedeemStatusById                : `SELECT redeem_status FROM coupon_inventory_hospital_entity_mapping WHERE id = ?`,

	getWalletCouponMappingsByMappingId : `SELECT hm.id AS mappingId, hm.wallet_id AS walletId, hm.active as status,
                                       	hm.coupon_inventory_hospital_mapping_id AS hospitalCouponId FROM 
																				coupon_inventory_hospital_entity_mapping hm JOIN 
																				coupon_inventory_hospital_mapping cihm ON cihm.id = 
																				hm.coupon_inventory_hospital_mapping_id WHERE hm.id IN(?);`,

	getCouponInventoryMapping 	       : `SELECT id FROM coupon_inventory_hospital_mapping
																				WHERE active = 1 AND validity_to < CURRENT_TIMESTAMP`,

	getCouponInventoryEntityMapping 	 : `SELECT id FROM coupon_inventory_hospital_entity_mapping
																				WHERE active = 1 AND validity_to < CURRENT_TIMESTAMP`,

	getWalletCouponMapping             : `SELECT id FROM coupon_inventory_hospital_entity_mapping WHERE wallet_id = ? AND 
	                                      coupon_inventory_hospital_mapping_id = ? AND active = 1`,
																				
	getWalletTxnDoc                    : `SELECT id, txn_doc AS txnDoc FROM wallet_transaction_doc
																				WHERE wallet_history_id = ? LIMIT 1;`,

	getWalletTransactionDetails        : `SELECT c.name, c.mobile, u.email, h.display_name AS hospitalName,
																				w.wallet_serial AS walletSerial, wh.created AS transactionDate,
																				wh.mode_of_payment AS modeOfPayment, wh.amount FROM user u, customer c,
																				wallet w, hospital h, wallet_history wh WHERE w.id = wh.wallet_id
																				AND h.id = w.hospital_id AND c.id = w.customer_id AND u.id = c.user_id
																				AND wh.id = ? LIMIT 1;`,
																				
	getNbfc1                           : `SELECT (SELECT COUNT(*) FROM nbfc_details `,

	getNbfc2                           : `) AS total, id, name, active FROM nbfc_details `,

	getNbfcProductQuery1               : `SELECT (SELECT COUNT(*) FROM nbfc_details nd JOIN nbfc_product_mapping npm 
																				ON nd.id = npm.nbfc_details_id`,

	getNbfcProductQuery2               : `) AS total, npm.id, nd.name, npm.nbfc_details_id, npm.product_name, 
																			 npm.product_display_name, npm.minimum_amount, npm.maximum_amount,
																			 npm.subvention, npm.down_payment, npm.tenure, npm.interest, npm.processing_fee, 
																			 npm.active FROM nbfc_details nd JOIN nbfc_product_mapping npm 
																			 ON nd.id = npm.nbfc_details_id `,

	getNbfc                            : `SELECT id FROM nbfc_details `,

	getNbfcProduct                     : `SELECT id, nbfc_details_id FROM nbfc_product_mapping `,

	getNbfcProductIdsByNbfcId          : `SELECT id FROM nbfc_product_mapping WHERE nbfc_details_id = ?`,

	getArticleByGroupId                : `SELECT id FROM article WHERE media_group_id = ? AND active = 1`,

	getWalletHistoryById               : `SELECT amount, mode_of_payment, transaction_id, child_id, created FROM
																				wallet_history WHERE id = ?`,

	getChildWalletHistoryAmountById    : `SELECT amount FROM wallet_history WHERE id = ?`,

	getLabTestPaymentStatus            : `SELECT wallet_history_id AS walletHistoryId, 
																				transaction_date AS transactionDate, amount, mode_of_payment AS modeOfPayment,
																				transaction_id AS transactionId FROM wallet_lab_test_request WHERE id = ?`,
																				
	getWallets                         : `SELECT w.id AS walletId, w.wallet_serial AS walletSerial, 
																				c.name AS customerName, c.mobile, u.email, h.display_name AS hospitalDisplayName
																				FROM wallet w JOIN customer c ON w.customer_id = c.id 
																				JOIN user u ON c.user_id = u.id JOIN hospital h ON w.hospital_id = h.id`,

	insertCity                         : `INSERT INTO city(city_name, state_id, delivery_available) VALUES(?, ?, 1)`,

	insertLocation                     : `INSERT INTO location(location_name, pincode, city_id, area, loan_available)
	                                      VALUES(?, ?, ?, ?, 1);`,
																				
  insertYapHospitalPos	 			       : `INSERT INTO yap_hospital_pos (hospital_id, pos_tid, pos_type, created_by,
																				qr_type)	VALUES (?, ?, ?, ?, ?)`,
	
	createCouponInventory				       : `INSERT INTO coupon_inventory (coupon_code, active,created_by,
																				updated_by)	VALUES (?,?,?,?)`,
	       
	addHospitalCoupons					       : `INSERT INTO coupon_inventory_hospital_mapping (hospital_id, coupon_inventory_id, 
																				coupon_usage, addition_information, validity_from, validity_to, active, 
																				created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

	addConfigChanges  					       : `INSERT INTO config_changes_audit (table_name, type, query, created_by) 
																				VALUES (?,?,?,?)`,

	addCouponInventoryHospEntityMap		 : `INSERT INTO coupon_inventory_hospital_entity_mapping (entity_type,
																				entity_id, coupon_inventory_hospital_mapping_id, active, coupon_usage_left,
																				total_coupon_usage, validity_to, created_by, updated_by, 
																				wallet_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	
	insertIpdReversalInWalletHistory   : `INSERT INTO wallet_history (wallet_id, amount, type, mode_of_payment, 
																				transaction_id, created_by) VALUES (?, ?, 'BALANCE', ?, ?, ?)`,
	
	insertKitAmount										 : `INSERT INTO hospital_kit_amount_mapping(hospital_id, kit_type, amount,
																				ap_kit_amount_share, hospital_kit_amount_share, tds_amount, gst_amount,
																				taxable_amount, created_by_user, insurance_required, kit_required,
																				non_kyc_required) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	
	populateOtpPlan 									 : `INSERT INTO otp_plan (mobile, email, otp, active) VALUES `,

	addNodeEdgeData                    : `INSERT INTO hospital_network_mapping (node_hospital_id, edge_hospital_id) 
																				VALUES `,
	addTemplate                        : `INSERT INTO email_metadata (template_name, subject, cc, email_to, bcc, enabled)
																			  VALUES (?, ?, ?, ?, ?, 1)`,

	populateSlowQueries                : 'INSERT INTO slow_queries_audit (process_id, info, command, time) VALUES ',
	
	addKitInventory                    : `INSERT INTO kit_inventory (kit_number, validation_number, type, status, active,
																				invoice_number, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,

	addHospitalToInsuranceMapping      : `INSERT INTO hospital_insurance_vendor_mapping
																				(hospital_id, insurance_vendor_id, active, created_by, updated_by) 
																				VALUES (?, ?, ?, ?, ?);`,

	insertLoyaltyBenefitOfferingFull 	 : `INSERT INTO loyalty_benefit_offering (hospital_id, type, benefit_percent,
																				yap_hospital_pos_id, single_txn_amount_limit, benefit_amount,  
																				ap_commission_percent, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
																				
	insertLoyaltyBenefitOffering    	 : `INSERT INTO loyalty_benefit_offering (hospital_id, type, benefit_percent,
																				benefit_amount, ap_commission_percent, created_by) VALUES (?, ?, ?, ?, ?, ?)`,					
	
	addHospitalMapping                 : `INSERT INTO hospital_user_mapping (hospital_id, user_id, role, updated_by_user) 
	                                      VALUES `,

  insertSpecialization               : `INSERT INTO specialization (name `,

	insertHospitalSpecializationMap    : `INSERT INTO hospital_specialization_mapping (hospital_id, specialization_name,  
		                                    created_by, updated_by, specialization_id) VALUES `,
																				
	insertLabTestRequest     					 : `INSERT INTO wallet_lab_test_request (wallet_id, appointment_time, location_id,
																				hospital_id, address, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,

	insertLabTestRequestStatus				 : `INSERT INTO wallet_lab_test_request_status (wallet_lab_test_request_id, remarks,
																				status, created_by, updated_by) VALUES (?, ?, ?, ?, ?);`,

	populateKitInventory 							 : `INSERT INTO kit_inventory (kit_number, validation_number, type, status, active, 
																				created_by, updated_by, invoice_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

	insertCardOrderRequest             : `INSERT INTO card_order_request (hub_name, total_card, status, issuing_partner, 
		                                    happay_address_id, active, requested_by, approved_by, requested_on,
																				invoice_number, approved_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

	insertMediaGroup                   : `INSERT INTO media_group (name, logo_url, created_by, updated_by) 
																				VALUES (?, ?, ?, ?)`,

	insertMediaArticle                 : `INSERT INTO article (media_group_id, title, subtitle, link, release_date, 
																				created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
																				
	insertNbfc                         : 'INSERT INTO nbfc_details (name, created_by, updated_by) VALUES (?, ?, ?)',

	insertNbfcProduct                  : `INSERT INTO nbfc_product_mapping (nbfc_details_id, product_name, 
		                                    product_display_name, subvention, down_payment, tenure, interest, 
																				processing_fee, minimum_amount, maximum_amount, created_by, updated_by) 
																				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	addHospitalPickup                  : `INSERT INTO hospital_pickup (hospital_id, amount_to_collect, status, type, 
																			  wallet_id, kit_inventory_id) VALUES (?, ?, ?, ?, ?, ?)`,
																				
	addHospitalPickupStatus            : `INSERT INTO hospital_pickup_status (hospital_pickup_id, pickup_status, 
																				created_by) VALUES (?, ?, ?)`,	
																									
	insertWalletTxnDoc         				 : `INSERT INTO wallet_transaction_doc (wallet_history_id, txn_doc) VALUES (?, ?);`,

  updateCity                         : `UPDATE city SET ? WHERE id = ?;`,

	updateLocation                     : `UPDATE location SET ? WHERE id = ?;`,
																
	updateHospitalCouponStatus				 : `UPDATE coupon_inventory_hospital_mapping SET active = ?, 
																				updated_by = ? WHERE id = ?`,

	updateYapHospitalPos      	       : `UPDATE yap_hospital_pos SET active = 0, pos_tid = ? WHERE id IN (?)`,

	updateCouponInventoryHospEntityMap : `UPDATE coupon_inventory_hospital_entity_mapping SET active = 0 WHERE
	                                      wallet_id = ?;`,

	updateWalletHospital  						 : `UPDATE wallet SET hospital_id = ? WHERE id = ?;`,

	updateHospital                     : `UPDATE hospital SET ? WHERE id = ?;`,

	updatePatientHospitalLead					 : `UPDATE patient_hospital_lead SET ? WHERE id = ?`,

	updateInPaytmPaymentRequest        : `UPDATE paytm_payment_request SET payment_added = 0, wallet_id = null
																				where transaction_id = ?`,
	
	updateInEzetapPosRequest					 : `UPDATE ezetap_pos_request SET internal_ref_no = null, 
																				wallet_history_id = null,wallet_id = null, updated_by_user = ? where rrn = ?`, 

	updateWalletBalance                : `UPDATE wallet SET wallet_balance = wallet_balance - ? WHERE id = ?`,

	updateReversedWhId                 : `UPDATE wallet_history SET reversed_wh_id = ? WHERE id = ?;`,

	updatePatientHospitalLeadJsonData  : `UPDATE patient_hospital_lead SET json_data = ? WHERE id = ?;`,

	inactivateHospitalNetworkMapping   : `UPDATE hospital_network_mapping SET active = 0 where id in (?) `,
	
	deactivateKitAmount                : `UPDATE hospital_kit_amount_mapping SET active = 0,
																				updated_by_user = ? WHERE id IN (?);`,

	deactivateKitAmountMapping         : `UPDATE hospital_kit_amount_mapping SET active = 0,
																				updated_by_user = ? WHERE id = ?;`,
																				
	updateCihmRow											 : 'UPDATE coupon_inventory_hospital_mapping SET ? WHERE id = ?;',
	
	updateTemplate                     : `UPDATE email_metadata SET ? WHERE id = ?;`,

	updateTemplateStatus               : `UPDATE email_metadata SET enabled = ? WHERE id IN (?);`,

	deactivateCouponInventoryMapping   : 'UPDATE coupon_inventory_hospital_entity_mapping SET active = 0 WHERE id = ?;',
	
	updateSlowQuery                    : `UPDATE slow_queries_audit SET time = ? WHERE id = ?;`,
	
  removeHospFromInsuranceMapping     : `UPDATE hospital_insurance_vendor_mapping set active = 0 where id = ?`,

	updateUserById                		 : `UPDATE user SET active = ?, updated_by = ? WHERE id = ?`,

	updateCommissionPercentage         : `UPDATE loyalty_benefit_offering SET ap_commission_percent = ? where id = ?`,

	updateLoyaltyBenefitOfferingById   : `UPDATE loyalty_benefit_offering SET yap_hospital_pos_id = NULL WHERE id = ?`,

	updateLoyaltyBenefitOfferingStatus : `UPDATE loyalty_benefit_offering SET active = 0 WHERE id IN (?)`,

	updateHospitalApPercentage         : `UPDATE hospital SET ap_fees = ? WHERE id = ?`,
	
	updateHospitalWorkingEmail         : `UPDATE hospital_working_email SET email_to = ? where id = ?`,
	
	deactivateCouponMapping            : `UPDATE coupon_inventory_hospital_mapping SET active = 0 WHERE id in (?);`,

	deactivateEntityMapping            : `UPDATE coupon_inventory_hospital_entity_mapping SET active = 0 WHERE
	                                      coupon_inventory_hospital_mapping_id in (?);`,
																				
	updateHospitalRemarks              : `UPDATE hospital SET remarks = ? WHERE id = ?`,
	
	updateHospitalProductType          : `UPDATE hospital SET product_type = ?, updated_by_user = ? WHERE id = ?;`,
	
	updateEmailToOrCcInHospWorkEmail   : `UPDATE hospital_working_email SET ? WHERE id = ?`,

	updateEmailToAndCcInHospWorkEmail  : `UPDATE hospital_working_email SET email_to = ?, cc = ? where id = ?`,

	updateDigitalCommunication         : `UPDATE digital_communication SET ? WHERE id = ?`,

	updateEmailInEmailMetadata         : `UPDATE email_metadata SET ? WHERE id = ?`,

	updateUser                         : `UPDATE ?? SET ? WHERE id = ?`,
	
	updateUserEmail                    : `UPDATE user SET email = ? WHERE id = ?`,

	updateHospitalWorkingEmails        : `UPDATE hospital_working_email SET email_to = ? WHERE id = ?`,

	updateEnumStore                    : `UPDATE enum_store SET enum_value = ? WHERE enum_key = ?`,
	
	updateInsuranceCustomer            : `UPDATE insurance_customer SET ? WHERE customer_id = ?`,
	
	updateKitInventory                 : `UPDATE kit_inventory SET hospital_kit_amount_mapping_id = ? WHERE id = ?`,

	updateYesBankCusReg                : `UPDATE yesbank_customer_registration SET hospital_kit_amount_mapping_id = ?,
																				customer_type = ?	WHERE id = ?`,

	updateHospitalPickup							 : `UPDATE hospital_pickup SET amount_to_collect = ? WHERE id = ?`,

	updateSubHospitalUser              : `UPDATE sub_hospital_user SET mobile = ? WHERE id = ?;`,

	updatePickupDepositDate            : `UPDATE pickup_deposit_status SET deposit_date = ? WHERE id = ?;`,

	updateYapHospitalPosStatus 	       : `UPDATE yap_hospital_pos SET active = 0 WHERE id IN (?)`,

	updateInsuranceCustomerEmail       : `UPDATE insurance_customer SET email = ? WHERE customer_id = ?`,

	updateSpecialization               : `UPDATE specialization SET ? WHERE id = ?`,

	deactivateSpecializationMapping    : `UPDATE hospital_specialization_mapping SET active = 0 WHERE id IN (?)`,
	
	deactivateHospitalMapping          : `UPDATE hospital_user_mapping SET active = 0, updated_by_user = ?
																				WHERE id IN (?)`,

	updateHospitalIdInHospitalPickup   : `UPDATE hospital_pickup SET hospital_id = ? WHERE id IN (?)`,
																				
	deactivateLabRequestStatus				 : `UPDATE wallet_lab_test_request_status SET active = 0, updated_by = ?
																				WHERE id = ?;`,

	updateMediaGroup				           : `UPDATE media_group SET ? WHERE id = ?`,

	updateMediaArticle                 : `UPDATE article SET ? WHERE id = ?`,
	
	deactivateCouponEntityMapping      : `UPDATE coupon_inventory_hospital_entity_mapping SET active = 0 WHERE id in (?)`,
	
	updateCihemRow                     : `UPDATE coupon_inventory_hospital_entity_mapping SET ? WHERE id = ?;`,
	
	updateNbfc                         : `UPDATE nbfc_details SET ? WHERE id = ?`,

	updateNbfcProduct                  : `UPDATE nbfc_product_mapping SET ? WHERE id = ?`,
 
	deactivateMediaArticles            : `UPDATE article SET active = 0 WHERE id IN (?) `,
	
	updateLabRequestPaymentDetails     : `UPDATE wallet_lab_test_request SET ? WHERE id = ?`,

	deactivateNbfcProducts             : `UPDATE nbfc_product_mapping SET active = 0 WHERE id IN (?)`,

	deleteInHospitalPickup						 : `DELETE FROM hospital_pickup WHERE	wallet_history_id = ?`,

	deleteCustomerVerificationDocs     : `DELETE FROM customer_verification_docs WHERE id IN (?)`,

	deleteToken                        : 'DELETE FROM oauth_access_token WHERE user_name = ?;',

	deleteHospitalPickup               : 'DELETE FROM hospital_pickup WHERE kit_inventory_id = ?',

	deleteWalletTxnDoc         				 : `DELETE FROM wallet_transaction_doc WHERE id = ?;`
}

module.exports = Queries