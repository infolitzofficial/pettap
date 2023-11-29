import { ZIM } from "zego-zim-web";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// Assets
import incomingCall from "../Assets/audio/incomingCall.wav";
import zegoCloudcredentials from "../zegocloud_credentials.json";

const appID = zegoCloudcredentials.appID;

const initialiseZegocloud = (userID, userName, token, playAudioForIncomingCall, endCallRinging) => {
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
        // The callback for the call invitation is accepted before joining the room (a room is used for making a call)
        onSetRoomConfigBeforeJoining: (callType) => {
            return {
                onJoinRoom: () => {
                    endCallRinging();
                },
                showScreenSharingButton: false,
                lowerLeftNotification: {
                    showUserJoinAndLeave: false,
                    showTextChat: false
                },
                showMyCameraToggleButton: false,
                showAudioVideoSettingsButton: false,
            }
        },
        onIncomingCallReceived: (callID, caller, callType, callees) => {
            playAudioForIncomingCall();
        },
        onIncomingCallCanceled: (callID, caller) => {endCallRinging()},

        onOutgoingCallAccepted: (callID, callee) => {endCallRinging()},

        onOutgoingCallRejected: (callID, callee) => {endCallRinging()},

        onOutgoingCallDeclined: (callID, callee) => {endCallRinging()},

        onIncomingCallTimeout: (callID, caller) => {endCallRinging()},

        onOutgoingCallTimeout: (callID, callees) => {endCallRinging()}
    })
    zp.setCallInvitationConfig({
        onCallInvitationEnded: (reason,data) =>{
            endCallRinging();
        },  
    }) 
    return zp;        
}

export {initialiseZegocloud};