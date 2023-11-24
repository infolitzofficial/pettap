import { ZIM } from "zego-zim-web";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// Assets
import incomingCall from "../Assets/audio/incomingCall.wav";
import zegoCloudcredentials from "../zegocloud_credentials.json";

const appID = zegoCloudcredentials.appID;

const initialiseZegocloud = (userID, userName, token) => {
    const KitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        appID,
        token,
        null,
        userID,
        userName
    );
    let zp = ZegoUIKitPrebuilt.create(KitToken);

    // add plugin
    zp.addPlugins({ ZIM });

    zp.setCallInvitationConfig({
        ringtoneConfig: {
            incomingCallUrl: incomingCall, 
            outgoingCallUrl: incomingCall, 
        },
        onIncomingCallTimeout: (callID, caller) => {
        },  
    });

    zp.setCallInvitationConfig({
        // The callback for the call invitation is accepted before joining the room (a room is used for making a call)
        onSetRoomConfigBeforeJoining: (callType) => {
            return {
                showScreenSharingButton: false,
                lowerLeftNotification: {
                    showUserJoinAndLeave: false,
                    showTextChat: false
                },
                showMyCameraToggleButton: false,
                showAudioVideoSettingsButton: false,
            }
        },
    })
    return zp;        
}

export {initialiseZegocloud};