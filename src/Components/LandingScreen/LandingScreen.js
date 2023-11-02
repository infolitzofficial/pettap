import { useState, useRef, useEffect } from "react";

import { CometChatUI } from "../../comet-chat-react-ui-kit/CometChatWorkspace/src/components";

// components
import PetProfile from "../PetProfile/PetProfile";
import LoginForm from "../LoginForm/LoginForm";

//Service
import { getPetDetails } from "../../Service/api.js";
import { loginToTappetApp } from "../../Service/api.js";

// Assets
import { AiOutlineDownCircle } from "react-icons/ai";
import { MdOutlineMessage } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";

//style
import "../LandingScreen/LandingScreen.css";

// Hooks
import { useCometchatLogin } from "../../Hooks/useCometchatLogin";

const LandingScreen = (props) => {
    const [messageButton, setMessageButton] = useState(false);
    const [callButton, setCallButton] = useState(false)
    const [profilevisibility, setProfileVisibility] = useState(true);
    const [homePageVisibility, setHomePageVisibility] = useState(true);
    const [petDetails, setpetDetails] = useState([]);
    const [loginModal, setLoginModal] = useState(false);
    const [userConversationId, setUserConversationId] = useState(null);
    const [userClickedButton, setUserClickedButton] = useState(null);
    const [errorMessage, setErrorMessage] = useState(false);
    const profileElement = useRef();
    const  { cometchatLogin, isLoggedIntoCometchat } = useCometchatLogin();
    const petId = 16;

    useEffect(() => {
        const fetchData = async() => {
            const response = await getPetDetails(petId);
            if(response.status === 200) {
                setpetDetails(response?.data?.result)
            }
            let userData = JSON.parse(localStorage.getItem("user"));
            if(userData?.conversationID && userData.name) {
                setUserConversationId(userData.conversationID);
                let userName = userData.name;
                let userId = userData.conversationID;
                cometchatLogin(userId, userName);
            }
        }
        fetchData();
    },[])

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
            handleClickOnScroll()
        }
    },[props.scrollValue])

    const handleClickOnScroll = () => {
        profileElement.current?.scrollIntoView({behavior: 'smooth'});
        setHomePageVisibility(false);
    };

    const loadLandingScreen = () => {
        setMessageButton(false);
        setProfileVisibility(true);
        setUserClickedButton(null);
    };

    const changeLoginModalStatus = () => {
        setLoginModal(false);
        setUserClickedButton(null);
        setErrorMessage(false);
    }

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

    const loginToTappet = async(userData) => {
        const loginResponse = await loginToTappetApp(userData);
        if(loginResponse.status === 200 && loginResponse.data.result.u_id) {
            let cometchatID = `comechatuser_${loginResponse.data.result.u_id}`
            const data = {
                "conversationID": cometchatID,
                "name": `${loginResponse.data.result.u_first_name}`
            }
            localStorage.setItem("user", JSON.stringify(data));
            setLoginModal(false);
            setUserConversationId(cometchatID);
            let userName = loginResponse?.data?.result?.u_first_name;
            let userId = cometchatID;
            cometchatLogin(userId, userName);
        } else {
            setErrorMessage(true);
        }
    }

    return (
        <>
            {homePageVisibility === true ? (
                <>
                    {![messageButton, callButton].some(e=>e) ? (
                        <div className="landing-profile-container" onScroll={() => handleClickOnScroll()} style={{backgroundImage: `url(${petDetails.pet_image})`}}>
                            <div className="landing-page-title-section">
                                <div className="landing-page-pet-name">{petDetails.pet_name}</div>
                            </div>
                            <div className="scroll-container">
                                <div className="scroll-subcontainer">
                                    <AiOutlineDownCircle className="scroll-icon" onClick={() => handleClickOnScroll()}/>
                                    <div className="scroll-text">SCROLL DOWN</div>
                                </div>
                            </div>
                            <div className="landingpage-button-container">
                                <div className="landingpage-button-subcontainer">
                                    <button className="landingpage-call-button-container">
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
                            {loginModal === true ? (
                                <LoginForm modalActivationCall={changeLoginModalStatus} login={loginToTappet} error={errorMessage}/>
                            ) : null}
                        </div>
                    ) : (
                        <CometChatUI homePage={loadLandingScreen} clickedCall={callButton} petDetails={petDetails} userConversationID={userConversationId}/>
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
    )
}

export default LandingScreen;