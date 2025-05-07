"use client";

import axios from "axios";
// const serverURL = 'https://api.manovaidya.com'
//const serverURL = 'https://apiherbs.manovaidya.in'
const serverURL = 'http://localhost:5000'

const postData = async (url, body) => {
    try {
        var response = await axios.post(`${serverURL}/${url}`, body)
        var data = response.data
        return data
    }
    catch (e) {
        return null
    }
}

const getData = async (url) => {
    try {
        var response = await axios.get(`${serverURL}/${url}`)
        console.log(`${serverURL}/${url}`,"our url" );
        
        var data = response.data
        console.log("response in get data",data);
        
        return data
    }
    catch (e) {
        return null
    }
}
export { serverURL, postData, getData }