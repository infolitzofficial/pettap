import { useEffect, useState, useRef } from "react";

import { CometChatUI } from "../../comet-chat-react-ui-kit/CometChatWorkspace/src/components";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// Assets
import { MdOutlineMessage } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { AiOutlineArrowRight } from "react-icons/ai";
import { FaInstagramSquare } from "react-icons/fa";
import incomingCall from "../../Assets/audio/incomingCall.wav";
import outgoingCall from "../../Assets/audio/outgoingCall.wav";

// Service
import { loginToTappetApp } from "../../Service/api.js";

// Style
import "../PetProfile/PetProfile.css";

// Components
import LoginForm from "../LoginForm/LoginForm";

// Hooks
import { useCometchatLogin } from "../../Hooks/useCometchatLogin";

// Utils
import {initialiseZegocloud} from "../../Utils/zegocloudUtils.js";

const PetProfile = (props) => {
    const [profilePageMessageButton, setProfilePageMessageButton] = useState(false);
    const [profilePageCallButton, setProfilePageCallButton] = useState(false);
    const [allImageVisibility, setAllImageVisibility] = useState(false);
    const [loginModal, setLoginModal] = useState(false);
    const [userConversationId, setUserConversationId] = useState(null);
    const [userClickedButton, setUserClickedButton] = useState(null);
    const [errorMessage, setErrorMessage] = useState(false);
    const audioRef = useRef();
    const [callType, setCallType] = useState(null);
    const data = props.petDetails;
    const  { cometchatLogin, isLoggedIntoCometchat } = useCometchatLogin();

    useEffect(() => {
        setUserConversationId(props.userConversationID)
    },[props.userConversationID])

    const galleryImagesArr = (array, size) => {
        const result = [];
        if(array?.length > 0) {
            for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size));
            }
        }
        return result;
    }
      
    useEffect(() => {
        if(isLoggedIntoCometchat === true) {
            if(userClickedButton === "Message") {
                setProfilePageMessageButton(true);
            } 
            else if(userClickedButton === "Call") {
                setProfilePageCallButton(true);
            }
        }
    },[isLoggedIntoCometchat])

    useEffect(() => {
        let userData = JSON.parse(localStorage.getItem("user"));
        let zp;
        if(userData?.zegoID) {
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
                zp = initialiseZegocloud(userData?.zegoID, userData?.name, userData?.zegotoken, playAudioForIncomingCall, endCallRinging) 
                if(userClickedButton === "Call" ) {
                    setTimeout(() => {
                        handleSendCallInvitation(ZegoUIKitPrebuilt.InvitationTypeVoiceCall, zp);
                    },1000)
                }
            }
        } 
    },[userClickedButton])

    const galleryImages = galleryImagesArr(data?.images, 3);

    const loadProfileScreen = () => {
        setProfilePageMessageButton(false);
    };

    // Method to initialise tappet login
    const initialiseLoginFromProfilePage = (userAction) => {  
        setUserClickedButton(userAction) 
        if(userConversationId === null) {
            setLoginModal(true)
        } 
        else {
            if(userAction === "Message") {
                setProfilePageMessageButton(true);
            } 
            else if(userAction === "Call") {
                setProfilePageCallButton(true);
            }
        }
    }

    const changeLoginModalStatusInProfilePage = () => {
        setLoginModal(false);
        setErrorMessage(false);
        setUserClickedButton(null);
    }
    
    //method to login to cometchat and zegocloud
    const loginTappetFromProfilePage = async(userData) => {
        const loginResponse = await loginToTappetApp(userData);
        const tokenCreatedTime = new Date();
        if(loginResponse.status === 200 && loginResponse.data.result.u_id) {
            let zegoID = `zegouser_${loginResponse.data.result.u_id}`;
            let userName = loginResponse?.data?.result?.u_first_name;
            let tokenExpiryTime = loginResponse?.data?.result?.zego_token_expiry;
            const token = loginResponse?.data?.result?.zego_token;
            const zp = initialiseZegocloud(zegoID, userName, token, playAudioForIncomingCall, endCallRinging);
            let cometchatID = `comechatUser_${loginResponse.data.result.u_id}`;
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
            if(userClickedButton === "Call") {
                setTimeout(() => {
                    handleSendCallInvitation(ZegoUIKitPrebuilt.InvitationTypeVoiceCall, zp);
                },1000)
            }
            let userId = cometchatID;
            cometchatLogin(userId, userName);
        } else {
            setErrorMessage(true);
        }
    }

    // Method to send call invitation while clicking call button
    const handleSendCallInvitation = (callType, zp) => {
        setCallType('Outgoing');
        audioRef.current.play();
        const callee = `zegouser_${props.petDetails.added_by.u_id}`;
        if (!callee) {
            alert('userID cannot be empty!!');
            return;
        }
        const users = callee.split(',').map((id) => ({
            userID: id.trim(),
            userName: props.petDetails.added_by?.u_first_name,
        }));

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
                endCallRinging();
                setCallType(null);
            }
        })  
    }

    const handleAudioEnded = () => {
        // Restart the audio when it ends
        audioRef.current.currentTime = 0;
        audioRef.current.play();
    };
    
    const endCallRinging = () => {
        audioRef.current.pause();
    }

    const playAudioForIncomingCall = () => {
        setCallType("Incoming")
        audioRef.current.play();
    }

    return (
        <>
            {![profilePageMessageButton].some(e=>e) ? (
                <div className="pet-profile-container">
                    <div className="pet-profile-subcontainer">
                        <div className="title-section">
                            <div className="pet-name">{data.pet_name}</div>
                        </div>
                        <div className="image-container">
                            <img src={data.pet_image} alt="Loading.." className="pet-image"></img>
                        </div>
                        <div className="owner-section">
                            <div className="button-container">
                                <div className="button-subcontainer">
                                    <button className="call-button-container" onClick={() => {initialiseLoginFromProfilePage("Call");}}>
                                        <div className="call-button">
                                            <IoCallOutline />
                                            <div className="call-button-text">Call Owner</div>
                                        </div>
                                    </button>
                                    <button className="message-button-container" onClick={() => {initialiseLoginFromProfilePage("Message");}}>
                                        <div className="call-button">
                                            <MdOutlineMessage />
                                            <div>Message</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <div className="owner-details-container">
                                <div className="owner-details">
                                    <img className="owner-image" src={data?.added_by?.u_image} alt="Loading.."></img>
                                    <div className="owner-data">
                                        <div className="owner-name1">{data?.added_by?.u_first_name} {data?.added_by?.u_last_name}</div>
                                        <div className="owner-name2">{data?.pet_name}'s Owner</div>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-section">
                                <hr className="line"></hr>
                                <div className="breed-section">
                                    <h3 className="breed-title">Breed</h3>
                                    <h3 className="colon">:</h3>
                                    <h3 className="breed-description">{`${data.breed ? data?.breed[0].pb_name : null}`}</h3>
                                </div>

                                <hr className="line"></hr>
                                <div className="breed-section">
                                    <h3 className="breed-title">Gender</h3>
                                    <h3 className="colon">:</h3>
                                    <h3 className="breed-description">{data?.pet_gender}</h3>
                                </div>

                                <hr className="line"></hr>
                                <div className="breed-section">
                                    <h3 className="breed-title">Birthday</h3>
                                    <h3 className="colon">:</h3>
                                    <h3 className="breed-description">{data?.pet_dob}</h3>
                                </div>

                                <hr className="line"></hr>
                                <div className="breed-section">
                                    <h3 className="breed-title">Age</h3>
                                    <h3 className="colon">:</h3>
                                    <h3 className="breed-description">{data?.pet_age}</h3>
                                </div>

                                <hr className="line"></hr>
                                <div className="breed-section">
                                    <h3 className="breed-title">Size</h3>
                                    <h3 className="colon">:</h3>
                                    <h3 className="breed-description">{data?.pet_size}</h3>
                                </div>
                                <hr className="line"></hr>
                            </div>
                            <audio ref={audioRef} src= {callType=== 'Incoming' ? incomingCall : callType === 'Outgoing' ? outgoingCall : null} onEnded={handleAudioEnded}/>
                        </div>
                        <div className="gallery-container">
                            <div className="gallery-titles">
                                <div className="gallery-title1">PHOTOS</div>
                                <div className="gallery-title2-container" onClick={() => setAllImageVisibility(!allImageVisibility)}>
                                    <div>View All</div>
                                    <AiOutlineArrowRight className="gallery-icon"/>
                                </div>
                            </div>
                            {galleryImages.length > 0 ? (
                                <div className="gallery-section">
                                    {galleryImages.map((image,index) => {
                                        return (
                                            <div className="gallery-section1" key={index}>
                                                {allImageVisibility === true ? (
                                                    <>
                                                        <div className="gallery-section-colum1">
                                                            {image[0] ? (
                                                                <img className={`item${1}`} src={image[0]} alt="Loading.."></img>
                                                            ) : null}
                                                            {image[1] ? (
                                                                <img className={`item${2}`} src={image[1]} alt="Loading.."></img>
                                                            ) : null}
                                                        </div>
                                                        <div className="gallery-section-column2">
                                                            {image[2] ? (
                                                                <img className={`item${3}`} src={image[2]} alt="Loading.."></img>
                                                            ) : null}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {index < 2 ? (
                                                        <>
                                                            <div className="gallery-section-colum1">
                                                                {image[0] ? (
                                                                    <img className={`item${1}`} src={image[0]} alt="Loading.."></img>
                                                                ) : null}
                                                                {image[1] ? (
                                                                    <img className={`item${2}`} src={image[1]} alt="Loading.."></img>
                                                                ) : null}
                                                            </div>
                                                            <div className="gallery-section-column2">
                                                                {image[2] ? (
                                                                    <img className={`item${3}`} src={image[2]} alt="Loading.."></img>
                                                                ) : null}
                                                            </div>
                                                        </>
                                                        ) : null}
                                                    </>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : null}
                            <div className="instagram-container">
                                <FaInstagramSquare className="instagram-icon"/>
                                <div>View on Instagram</div>
                            </div>
                        </div>                        
                        <div className="notes-section-container">
                            <div className="note-section-title">NOTES</div>
                            <div className="note-description">
                                <div className="note-section">
                                    <p className="note">{data.pet_note}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {loginModal === true ? (
                        <LoginForm modalActivationCall={changeLoginModalStatusInProfilePage} login={loginTappetFromProfilePage} error={errorMessage}/>
                    ) : null}
                </div>
            ) : (
                <CometChatUI homePage={loadProfileScreen} clickedCall={profilePageCallButton} petDetails={props.petDetails} userConversationID={userConversationId}/>
            )}
        </>
    )
}   

export default PetProfile;