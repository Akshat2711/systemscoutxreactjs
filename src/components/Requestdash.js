import React from 'react';
import './Requestdash.css';
import { Nearbydetect } from './Nearbydetect';
import { db } from '../firebase/firebase'; 
import { ref as dbRef, set, onValue, update, push } from "firebase/database";


export const Requestdash = () => {

  const nearby_info = Nearbydetect();
  const username=localStorage.getItem("user");
  


  // Function to send req 
  function sendreq(receiver_name) {
    console.log('onclick', receiver_name);
    const msgRef=dbRef(db,`systemscoutpcinfo/${receiver_name}/pendingreq`);
     
    push(msgRef,{name:username}).then(()=>{alert(`Request send to ${receiver_name}`)});



  }



  return (
    <div className="requestdash_parent">
      <h1 className="heading_reqdash">Nearby Devices</h1>
      <div className="requestdash_child">
        {nearby_info.map((device) => (
          <div className="reqdash_box" key={device.id}>
            <p className="device_name">{device.id}</p>
            <div className="icon_comp"></div>
            {/* Use an arrow function to pass the parameter */}
            <button
              className="invite_btn"
              onClick={() => sendreq(device.id)}
            >
              Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
