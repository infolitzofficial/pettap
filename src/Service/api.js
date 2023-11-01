import axios from "axios";

const baseUrl = 'http://ec2-16-170-98-0.eu-north-1.compute.amazonaws.com:4001/api';

// Get pet details
export const getPetDetails = async (id) => {
    try {
      return await axios.get(baseUrl + `/v1/pets/get_pet_details_public/${id}`);
    } catch (err) {
      console.log("Error : ", err);
    }
};

export const loginToTappetApp = async (data) => {
    try {
        return await axios.post(baseUrl + `/v1/guest/signup`, data);
    } catch (err) {
        console.log("Error : ", err);
    }
}