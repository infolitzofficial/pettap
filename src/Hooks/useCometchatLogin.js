import { CometChat } from "@cometchat-pro/chat";

import credentials from "../../src/cometchat_credentials.json";
import { useState } from "react";

const appID = credentials.appID
const region = credentials.region;
const authKey = credentials.authKey;

export const useCometchatLogin = () => {
    const [isLoggedIntoCometchat, setIsLoggedIntoCometchat] = useState(false);

    const createCometChatUser = (conversationId, userName) => {
        var name = userName
        const metadata = {
            is_guest : true
        }
        var user = new CometChat.User(conversationId);
        user.setName(name);
        user.setMetadata(metadata);
        CometChat.createUser(user, authKey).then(
            user => {
                console.log("user created", user);
                loginTOCometChat(conversationId)
            },error => {
                console.log("error", error);
                loginTOCometChat(conversationId)
            }
        )
    }

    const loginTOCometChat = (conversationId) => {
        CometChat.login(conversationId, authKey).then(
            user => {
                console.log("user loggedin successfully", {user})
                setIsLoggedIntoCometchat(true);
            },
            error => {
                console.log("Login failed", { error });
                setIsLoggedIntoCometchat(false);
            }
        )
    }

    const cometchatLogin = (conversationId, userName) => {
        const appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(region).build();

        CometChat.init(appID, appSetting).then(
            () => {                
                console.log("Initialization completed successfully");
                createCometChatUser(conversationId, userName)
            },
            error => {
                console.log("Initialization failed with error:", error);
            }
        );
}; 
    
    return {cometchatLogin, isLoggedIntoCometchat}
}