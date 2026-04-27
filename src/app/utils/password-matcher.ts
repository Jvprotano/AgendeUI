import { AbstractControl } from '@angular/forms';

export class PasswordMatcher {
  static match(control: AbstractControl): void | null {
    const passwordControl = control.get('password');
    const confirmPasswordControl = control.get('confirmPassword');

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    const currentErrors = confirmPasswordControl.errors || {};
    const hasOnlyMatchError =
      Object.keys(currentErrors).length === 1 && !!currentErrors['match'];

    const clearMatchError = () => {
      if (!currentErrors['match']) return;

      const { match, ...otherErrors } = currentErrors;
      confirmPasswordControl.setErrors(
        Object.keys(otherErrors).length ? otherErrors : null,
      );
    };

    if (passwordControl.pristine || confirmPasswordControl.pristine) {
      if (hasOnlyMatchError) {
        clearMatchError();
      }
      return null;
    }

    if (passwordControl.value === confirmPasswordControl.value) {
      clearMatchError();
      return null;
    }

    confirmPasswordControl.setErrors({
      ...currentErrors,
      match: true,
    });

    return null;
  }
}
