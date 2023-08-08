import {notification} from "ant-design-vue";

interface HandleErrorParams {
    error: any;
    message?: string;
}

const handleError = ({error, message='Error'}: HandleErrorParams) => {
    const description = (error?.data?.errors && Object.keys(error?.data?.errors).length && Object.values(error.data.errors)) ||
        error.messages ||
        error.message;
    notification.error({
        message: message,
        description: description,
    });
}

export default handleError;