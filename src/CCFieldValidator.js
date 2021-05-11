import valid from "card-validator";
import pick from "lodash.pick";
import values from "lodash.values";
import every from "lodash.every";

const toStatus = (validation, value='') => {
  // special case for card number when all digits typed
  if (value.replace(/\s/g, '').length === 16) {
    return validation.isValid ? "valid" : "invalid"
  }

  return validation.isValid ? "valid" :
         validation.isPotentiallyValid ? "incomplete" :
         "invalid";
};

const FALLBACK_CARD = { gaps: [4, 8, 12], lengths: [16], code: { size: 3 } };
export default class CCFieldValidator {
  constructor(displayedFields, validatePostalCode) {
    this._displayedFields = displayedFields;
    this._validatePostalCode = validatePostalCode;
  }

  validateValues = (formValues) => {
    const numberValidation = valid.number(formValues.number);
    const expiryValidation = valid.expirationDate(formValues.expiry);
    const maxCVCLength = (numberValidation.card || FALLBACK_CARD).code.size;
    const cvcValidation = valid.cvv(formValues.cvc, maxCVCLength);

    const validationStatuses = pick({
      number: toStatus(numberValidation, formValues.number),
      expiry: toStatus(expiryValidation),
      cvc: toStatus(cvcValidation),
      name: !!formValues.name ? "valid" : "incomplete",
      postalCode: this._validatePostalCode(formValues.postalCode),
    }, this._displayedFields);

    return {
      valid: every(values(validationStatuses), status => status === "valid"),
      status: validationStatuses,
    };
  };
}
