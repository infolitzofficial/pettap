import { useState, useRef, useEffect } from "react";

import { CometChatUI } from "../../comet-chat-react-ui-kit/CometChatWorkspace/src/components";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// components
import PetProfile from "../PetProfile/PetProfile";
import LoginForm from "../LoginForm/LoginForm";

// Service
import { getPetDetails } from "../../Service/api.js";
import { loginToTappetApp } from "../../Service/api.js";

// Assets
import { AiOutlineDownCircle } from "react-icons/ai";
import { MdOutlineMessage } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import incomingCall from "../../Assets/audio/incomingCall.wav";

// style
import "../LandingScreen/LandingScreen.css";

// Hooks
import { useCometchatLogin } from "../../Hooks/useCometchatLogin";

// Utils
import {initialiseZegocloud} from "../../Utils/zegocloudUtils.js";

const LandingScreen = (props) => {
    const [messageButton, setMessageButton] = useState(false);
    const [callButton, setCallButton] = useState(false)
    const [profilevisibility, setProfileVisibility] = useState(false);
    const [homePageVisibility, setHomePageVisibility] = useState(true);
    const [petDetails, setpetDetails] = useState([]);
    const [loginModal, setLoginModal] = useState(false);
    const [userConversationId, setUserConversationId] = useState(null);
    const [userClickedButton, setUserClickedButton] = useState(null);
    const [errorMessage, setErrorMessage] = useState(false);
    const [isPetAvailable, setIsPetAvailable] = useState(false);
    const [isPetDetailsLoaded, setIsPetDetailsLoaded] = useState(false);
    const profileElement = useRef();
    const  { cometchatLogin, isLoggedIntoCometchat } = useCometchatLogin();

    useEffect(() => {
        const fetchData = async() => {
            const currentURL = window.location.href;
            const urlParts = currentURL.split('/');
            const lastValueInURL = urlParts[urlParts.length - 1];
            const specialCharsRegex = /^[0-9]+$/;
            const value = specialCharsRegex.test(lastValueInURL);
            let petId;
            if(value === true && lastValueInURL !== '') {
                petId = lastValueInURL;
            } else {
                setIsPetAvailable(false);
            }
            const response = await getPetDetails(petId);
            if(response?.status === 200) {
                if(Object.keys(response?.data?.result).length !== 0) {
                    setpetDetails(response?.data?.result);
                    setIsPetDetailsLoaded(true);
                    setIsPetAvailable(true);
                } else {
                    setIsPetAvailable(false);
                    setIsPetDetailsLoaded(true);
                }
            }
        }
        fetchData();
    },[])

    useEffect(() => {
        let userData = JSON.parse(localStorage.getItem("user"));
        let zp;
        if(userData?.zegoID && userData?.cometchatID && userData.name) {
            userData.ZegoTokenCreatedTime = new Date(userData.ZegoTokenCreatedTime)
            const tokenExpirationTime = userData.ZegoTokenCreatedTime.getTime() + userData.zegoTokenDuration * 1000;
            const currentTime = new Date().getTime();
            if (currentTime > tokenExpirationTime) {
                console.log('Token has expired');
                setUserConversationId(null);
            } else {
                if(userData?.cometchatID && userData.name) {
                    setUserConversationId(userData.cometchatID);
                    let userName = userData.name;
                    let userId = userData.cometchatID;
                    cometchatLogin(userId, userName);
                }
                zp = initialiseZegocloud(userData?.zegoID, userData?.name, userData?.zegotoken) 
                if(userClickedButton === "Call" ) {
                    setTimeout(() => {
                        handleSendCallInvitation(ZegoUIKitPrebuilt.InvitationTypeVoiceCall, zp);
                    },1000)
                }
            }
        } 
    },[userClickedButton])

    useEffect(() => {
        if(isLoggedIntoCometchat === true) {
            if(userClickedButton === "Message") {
                setMessageButton(true);
                setProfileVisibility(false);
            } 
            else if(userClickedButton === "Call") {
                setCallButton(true);
                setProfileVisibility(false);
            }
        }
    },[isLoggedIntoCometchat])

    useEffect(() => {
        if(props.scrollValue === true && messageButton === false && callButton === false) {
            handleClickOnScroll();
        }
    },[props.scrollValue])

    const handleClickOnScroll = () => {
        profileElement.current?.scrollIntoView({behavior: 'smooth'});
        setHomePageVisibility(false);
        setProfileVisibility(true);
    };

    const loadLandingScreen = () => {
        setMessageButton(false);
        setUserClickedButton(null);
        setProfileVisibility(false);
    };

    const changeLoginModalStatus = () => {
        setLoginModal(false);
        setUserClickedButton(null);
        setErrorMessage(false);
    }

    // Method to initialise tappet login
    const initialiseLogin = (userAction) => {  
        setUserClickedButton(userAction) 
        if(userConversationId === null) {
            setLoginModal(true)
        } 
        else {
            if(userAction === "Message") {
                setMessageButton(true);
                setProfileVisibility(false);
            } 
            else if(userAction === "Call") {
                setCallButton(true);
                setProfileVisibility(false);
            }
        }
    }

    //method to login to cometchat and zegocloud
    const loginToTappet = async(userData) => {
        const tokenCreatedTime = new Date();
        const loginResponse = await loginToTappetApp(userData);
        if(loginResponse.status === 200 && loginResponse.data.result.u_id) {
            let zegoID = `zegouser_${loginResponse.data.result.u_id}`;
            let userName = loginResponse?.data?.result?.u_first_name;
            let tokenExpiryTime = loginResponse?.data?.result?.zego_token_expiry;
            const token = loginResponse?.data?.result?.zego_token;
            const zp = initialiseZegocloud(zegoID, userName, token);
            let cometchatID = `comechatuser_${loginResponse.data.result.u_id}`
            const data = {
                "cometchatID": cometchatID,
                "zegoID": zegoID,
                "name": userName,
                "zegotoken": token,
                "zegoTokenDuration": tokenExpiryTime,
                "ZegoTokenCreatedTime": tokenCreatedTime
            }
            localStorage.setItem("user", JSON.stringify(data));
            setLoginModal(false);
            setUserConversationId(cometchatID);
            let userId = cometchatID;
            if(userClickedButton === "Call") {
                setTimeout(() => {
                    handleSendCallInvitation(ZegoUIKitPrebuilt.InvitationTypeVoiceCall, zp);
                },1000)
            } 
            cometchatLogin(userId, userName);
        } else {
            setErrorMessage(true);
        }
    }

    // Method to send call invitation while clicking call button
    const handleSendCallInvitation = (callType, zp) => {
        const callee = `zegouser_${petDetails.added_by.u_id}`;
        if (!callee) {
            alert('userID cannot be empty!!');
            return;
        }
        const users = callee.split(',').map((id) => ({
            userID: id.trim(),
            userName: petDetails.added_by?.u_first_name,
        }));

        zp.setCallInvitationConfig({
            ringtoneConfig: {
                incomingCallUrl: incomingCall,
                outgoingCallUrl: incomingCall,
            },
        });

        // send call invitation
        zp.sendCallInvitation({
            callees: users,
            callType: callType,
            timeout: 60,
        })
        .then((res) => {
            console.warn(res);
            if (res.errorInvitees.length) {
            alert('The user dose not exist or is offline.');
            }
        })
        .catch((err) => {
            console.error(err);
        });  
        zp.setCallInvitationConfig({
            onCallInvitationEnded: (reason,data) =>{
                setUserClickedButton(null);
            },  
        })          
    }

    return isPetAvailable  && petDetails? (
        <>
            {homePageVisibility === true ? (
                <>
                    {![messageButton].some(e=>e) ? (
                        <div className="landing-profile-container" onScroll={() => handleClickOnScroll()} style={{backgroundImage: `url(${petDetails.pet_image})`}}>
                            <div className="landing-page-title-section">
                                <div className="landing-page-pet-name">{petDetails.pet_name}</div>
                            </div>
                            <div className="buttons">
                                <div className="scroll-container">
                                    <div className="scroll-subcontainer">
                                        <AiOutlineDownCircle className="scroll-icon" onClick={() => handleClickOnScroll()}/>
                                        <div className="scroll-text">SCROLL DOWN</div>
                                    </div>
                                </div>
                                <div className="landingpage-button-container">
                                    <div className="landingpage-button-subcontainer">
                                        <button className="landingpage-call-button-container" onClick={() => { initialiseLogin("Call");}}>
                                            <div className="landingpage-call-button">
                                                <IoCallOutline />
                                                <div className="landingpage-call-button-text">Call Owner</div>
                                            </div>
                                        </button>
                                        <button className="landingpage-message-button-container" onClick={() => { initialiseLogin("Message");}}>
                                            <div className="landingpage-call-button">
                                                <MdOutlineMessage />
                                                <div>Message</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {loginModal === true ? (
                                <LoginForm modalActivationCall={changeLoginModalStatus} login={loginToTappet} error={errorMessage}/>
                            ) : null}
                            <div className="scroll-visibility"/>
                        </div>
                    ) : (
                        <div className="cometchat-container">
                            <CometChatUI homePage={loadLandingScreen} clickedCall={callButton} petDetails={petDetails} userConversationID={userConversationId}/>
                        </div>
                    )}
                </>
            ):null}
            {profilevisibility === true ? (
                <>
                    <div ref={profileElement} className="pet-profile-section">
                        {petDetails.length !==0? (
                            <PetProfile petDetails={petDetails} userConversationID={userConversationId} login={loginToTappet}/>
                        ) : null}
                    </div>
                </>
            ) : null}
        </>
    ) : (
        <>
            {isPetDetailsLoaded === false ? (
                null
            ) : (
                <div className="pet-error-container">
                    <p className="pet-error-text">This pet is not registered!</p>
                </div>
            )}
        </> 

    )
}

export default LandingScreen;