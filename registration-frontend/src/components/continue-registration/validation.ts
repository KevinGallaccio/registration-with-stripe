import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
    firstName: Yup.string()
        .required('First name is required')
        .max(255, 'First name is too long'),
    lastName: Yup.string()
        .required('Last name is required')
        .max(255, 'Last name is too long'),
    phone: Yup.string()
        .required('Phone number is required')
        .matches(
            /^(\+\d{1,3}[-.]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
            'Please enter a valid phone number'
        ),
    avatarType: Yup.mixed<keyof typeof AvatarType>()
        .oneOf(Object.values(AvatarType), 'Please select a valid company type')
        .required('Company type is required'),
});
