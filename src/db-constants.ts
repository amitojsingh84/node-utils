const DB_CONSTANTS = {
  EditType : {
    UPDATE : 'UPDATE',
    INSERT : 'INSERT',
    DELETE : 'DELETE'
  },

  TableName : {
    YAP_HOSPITAL_POS                         : 'yap_hospital_pos',
    LOYALTY_BENEFIT_OFFERING                 : 'loyalty_benefit_offering',
    WALLET_HISTORY_TABLE                     : 'wallet_history',
    HOSPITAL_PICKUP                          : 'hospital_pickup',
    PAYTM_PAYMENT_REQUEST                    : 'paytm_payment_request',
    EZETAP_POS_REQUEST                       : 'ezetap_pos_request',
    WALLET                                   : 'wallet',
    COUPON_INVENTORY_HOSPITAL_MAPPING        : 'coupon_inventory_hospital_mapping',
    COUPON_INVENTORY                         : 'coupon_inventory',
    PATIENT_HOSPITAL_LEAD                    : 'patient_hospital_lead',
    COUPON_INVENTORY_HOSPITAL_ENTITY_MAPPING : 'coupon_inventory_hospital_entity_mapping',
    HOSPITAL                                 : 'hospital',
    HOSPITAL_KIT_AMOUNT_MAPPING              : 'hospital_kit_amount_mapping',
    PICKUP_DEPOSIT_STATUS                    : 'pickup_deposit_status',
    EMAIL_METADATA                           : 'email_metadata',
    HOSPITAL_INSURANCE_VENDOR_MAPPING        : 'hospital_insurance_vendor_mapping',
    USER                                     : 'user',
    EMPLOYEE                                 : 'employee',
    CUSTOMER                                 : 'customer',
    SUB_HOSPITAL                             : 'sub_hospital_user',
    UNAPPROVED                               : 'patient_hospital_lead',
    AGENT                                    : 'agent',
    HOSPITAL_WORKING_EMAIL                   : 'hospital_working_email',
    DIGITAL_COMMUNICATION                    : 'digital_communication',
    SUB_HOSPITAL_USER_LEAD                   : 'sub_hospital_user_lead',
    SUB_HOSPITAL_USER                        : 'sub_hospital_user',
    CITY                                     : 'city',
    LOCATION                                 : 'location',
    ENUM_STORE                               : 'enum_store',
    INSURANCE_CUSTOMER                       : 'insurance_customer',
    KIT_INVENTORY                            : 'kit_inventory',
    YESBANK_CUSTOMER_REGISTRATION            : 'yesbank_customer_registration',
    HOSPITAL_USER_MAPPING                    : 'hospital_user_mapping',
    CUSTOMER_VERIFICATION_DOCS               : 'customer_verification_docs',
    WALLET_LAB_TEST_REQUEST                  : 'wallet_lab_test_request',
    WALLET_LAB_TEST_REQUEST_STATUS           : 'wallet_lab_test_request_status',
    SPECIALIZATION                           : 'specialization',
    HOSPITAL_SPECIALIZATION_MAPPING          : 'hospital_specialization_mapping',
    CARD_ORDER_REQUEST                       : 'card_order_request',
    MEDIA_GROUP                              : 'media_group',
    ARTICLE                                  : 'article',
    OAUTH_ACCESS_TOKEN                       : 'oauth_access_token',
    WALLET_TRANSACTION_DOC                   : 'wallet_transaction_doc',
    NBFC_DETAILS                             : 'nbfc_details',
    NBFC_PRODUCT_MAPPING                     : 'nbfc_product_mapping'
  },

  Operators : {
    EQUALS             : '=',
    GREATER_THAN_EQUAL : '>=',
    LESS_THAN_EQUAL    : '<=',
    LIKE               : 'LIKE',
    NOT_EQUAL          : '<>',
    IS_NULL            : 'IS NULL',
    IS_NOT_NULL        : 'IS NOT NULL'
  },

  Orders : {
    DESC : 'DESC',
    ASC  : 'ASC'
  },

  Keys : {
    LOCATION : {
      locationName  : 'location_name',
      pincode       : 'pincode',
      cityId        : 'city_id',
      area          : 'area',
      loanAvailable : 'loan_available'
    },
    CITY : {
      cityName          : 'city_name',
      deliveryAvailable : 'delivery_available',
      stateId           : 'state_id'
    },
    EMPLOYEE : {
      name   : 'name',
      region : 'region'
    },
    CUSTOMER : {
      name          : 'name',
      address       : 'address',
      locationId    : 'location_id',
      dateOfBirth   : 'date_of_birth',
      maritalStatus : 'marital_status',
      gender        : 'gender',
    },
    HOSPITAL : {
      name         : 'primary_contact_person',
      hospitalName : 'name',
      address      : 'address',
      locationId   : 'location_id',
      latitude     : 'latitude',
      longitude    : 'longitude'
    },
    SUB_HOSPITAL : {
      name : 'name'
    }
  },
  Enum : {
    ENUM_STORE : {
      REGION      : 'region',
      KIT_INVOICE : 'kitInvoice'
    },
    KIT_TYPE : {
      DEMO     :'DEMO',
      CUSTOMER :'CUSTOMER',
      STAFF    :'STAFF',
      EMPLOYEE :'EMPLOYEE'
    },
    USER_TYPE : {
      EMPLOYEE     : 'EMPLOYEE',
      CUSTOMER     : 'CUSTOMER',
      HOSPITAL     : 'HOSPITAL',
      SUB_HOSPITAL : 'SUB_HOSPITAL'
    },
    MARITAL_STATUS :{
      MARRIED   : 'MARRIED',
      UNMARRIED : 'UNMARRIED',
      DIVORCED  : 'DIVORCED',
      WIDOW     : 'WIDOW'
    },
    GENDER : {
      MALE   : 'MALE',
      FEMALE : 'FEMALE',
      TRANS  : 'TRANS'
    }
  }
}

module.exports = DB_CONSTANTS