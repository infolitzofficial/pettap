import { useState } from "react";
import "../LoginForm/LoginForm.css";

// Assets
import zegoCloudcredentials from "../..//zegocloud_credentials.json";

const LoginForm = (props) => {
    const appID = zegoCloudcredentials.appID;
    const serverSecret = zegoCloudcredentials.serverSecret;
    const [userDetails, setUserDetails] = useState({
        "name" : null,
        "email": null,
        "server_secret": serverSecret,
        "app_id": appID,
    })
    const onFormDataChange = (updatedField, newValue) => {
        setUserDetails({...userDetails, [updatedField]: newValue})
    }

    return (       
        <div id="overlay">
            <div className="form">
                <div className="form-fields-container">
                    <div className="login-input-container">
                        <input className="name-field" placeholder="Enter your name" onChange={(e) => onFormDataChange("name", e.target.value)}></input>
                        <input className="email-field" placeholder="Enter your email id" onChange={(e) => onFormDataChange("email", e.target.value)}></input>
                    </div>
                    {props.error ? (
                        <div className="error-message">Please enter a valid email address</div>
                    ) : null}
                    <div className="login-button-container">
                        <button className="login-button" onClick={() => props.login(userDetails)}>Login</button>
                        <button className="login-cancel-button" onClick={() => props.modalActivationCall()}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginForm;