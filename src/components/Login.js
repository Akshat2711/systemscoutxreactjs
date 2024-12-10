import React, { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import "./Login.css";
import { db } from '../firebase/firebase'; 
import { ref as dbRef, set, onValue } from "firebase/database";

export const Login = () => {

  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  

  const signup=async ()=>{
    const msgRef = dbRef(db, `systemscoutpcinfo/${username}`);
    const msgdata={
      user: username,
      timestamp:'',
      message: '',
      pass:password,
      long:'',
      lati:'',
      pendingreq:'',
      friends:''
    }
    await set(msgRef,msgdata).then(()=>{alert("sign up success");})



  }


  const signin = () => {
    const msgRef = dbRef(db, `systemscoutpcinfo/`);
    
    onValue(msgRef, (snapshot) => {
      const userdata = snapshot.val();
      let isAuthenticated = false;
  
      for (let id in userdata) {
        if (username === id && password === userdata[id].pass) {
          isAuthenticated = true;
          console.log("Sign in success", username);

          localStorage.setItem("user",username)

          alert("Sign in successful!");
          break; // Exit the loop once authenticated
        }
      }
  
      if (!isAuthenticated) {
        console.log("Sign in unsuccessful");
        alert("Invalid username or password!");
      }
    });
  };

  

  return (
    <div className='parent'>
        <div className='child'>
          {/* <div className='username'>  <h1>Unique ID:{uniqueId}</h1></div> */}
          <div className='profile_container'></div>
          
          <div className='inputcontainer'>

            <input placeholder="Enter Username!" 
             value={username}
             onChange={(e) => setUsername(e.target.value)}>
            </input>

            <input placeholder="Enter Password!" type='password'  value={password}
              onChange={(e) => setPassword(e.target.value)}>
            </input>

            <br/>

            <button className='login_btn' onClick={signin}>
              Sign In
            </button>

            <button className='login_btn' onClick={signup}>
              Sign Up
            </button>

          </div>
        </div>
    </div>
  );
};
