import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // If no value is selected, skip validation
    }

    const today = new Date();
    const dob = new Date(control.value);
    let age = today.getFullYear() - dob.getFullYear();
    const month = today.getMonth() - dob.getMonth();
    
    if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age >= 18) {
      return null; // Valid age
    } else {
      return { underage: true }; // Invalid if under 18
    }
  };
}
