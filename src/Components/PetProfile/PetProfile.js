import { useEffect, useState } from "react";

import { CometChatUI } from "../../comet-chat-react-ui-kit/CometChatWorkspace/src/components";

// Assets
import { MdOutlineMessage } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { AiOutlineArrowRight } from "react-icons/ai";
import { FaInstagramSquare } from "react-icons/fa";

//Service
import { loginToTappetApp } from "../../Service/api.js";

// Style
import "../PetProfile/PetProfile.css";

// Components
import LoginForm from "../LoginForm/LoginForm";

// Hooks
import { useCometchatLogin } from "../../Hooks/useCometchatLogin";

const PetProfile = (props) => {
    const [profilePageMessageButton, setProfilePageMessageButton] = useState(false);
    const [profilePageCallButton, setProfilePageCallButton] = useState(false);
    const [allImageVisibility, setAllImageVisibility] = useState(false);
    const [loginModal, setLoginModal] = useState(false);
    const [userConversationId, setUserConversationId] = useState(null);
    const [userClickedButton, setUserClickedButton] = useState(null);
    const [errorMessage, setErrorMessage] = useState(false);
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

    const galleryImages = galleryImagesArr(data?.images, 3);

    const loadProfileScreen = () => {
        setProfilePageMessageButton(false);
    };

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
    
    const loginTappetFromeProfilePage = async(userData) => {
        const loginResponse = await loginToTappetApp(userData);
        if(loginResponse.status === 200 && loginResponse.data.result.u_id) {
            let cometchatID = `comechatUser_${loginResponse.data.result.u_id}`;
            const data = {
                "conversationID": cometchatID,
                "name": loginResponse.data.result.u_first_name,
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
            {![profilePageMessageButton, profilePageCallButton].some(e=>e) ? (
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
                                    <button className="call-button-container" >
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
                        <LoginForm modalActivationCall={changeLoginModalStatusInProfilePage} login={loginTappetFromeProfilePage} error={errorMessage}/>
                    ) : null}
                </div>
            ) : (
                <CometChatUI homePage={loadProfileScreen} clickedCall={profilePageCallButton} petDetails={props.petDetails} userConversationID={userConversationId}/>
            )}
        </>
    )
}   

export default PetProfile;