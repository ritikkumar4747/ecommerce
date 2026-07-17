import validator from "validator";

export default function validate(data) {
    if (!data?.email || !data?.password || !data?.name) {
        throw new Error("Please provide all the details");
    }

    if (!validator.isEmail(String(data.email))) {
        throw new Error("Invalid email");
    }

    if (!validator.isStrongPassword(String(data.password))) {
        throw new Error("Invalid password");
    }
}