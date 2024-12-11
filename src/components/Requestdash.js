import React, { useEffect, useState } from 'react';
import './Requestdash.css';
import { Nearbydetect } from './Nearbydetect';
import { db } from '../firebase/firebase'; 
import { ref as dbRef, onValue,push } from "firebase/database";

export const Requestdash = (props) => {
  const nearby_info_retrieve = Nearbydetect();
  const [nearby_info, setnearby_info] = useState(nearby_info_retrieve);
  const username = localStorage.getItem("user");

  useEffect(() => {
    // Fetch friend list and filter usersData
    const newRef = dbRef(db, `systemscoutpcinfo/${username}/friends`);
    onValue(newRef, (friendsSnapshot) => {
      const friendsData = friendsSnapshot.val();
      const friendArray = Object.values(friendsData || {}).map((friend) => friend.name);
      
      // Filter out users who are already friends
      const filteredUsers = nearby_info_retrieve.filter((user) => !friendArray.includes(user.id));
      setnearby_info(filteredUsers);
    });
  }, [username, nearby_info_retrieve]);

  // Function to send request 
  function sendreq(receiver_name) {
    console.log('onclick', receiver_name);
    const msgRef = dbRef(db, `systemscoutpcinfo/${receiver_name}/pendingreq`);
    push(msgRef, { name: username }).then(() => { alert(`Request sent to ${receiver_name}`); });
  }

  return (
    <div className="requestdash_parent" onClick={props.closerequestdash}>
      <h1 className="heading_reqdash">Nearby Devices</h1>
      <div className="requestdash_child">
        {nearby_info.map((device) => (
          <div className="reqdash_box" key={device.id}>
            <p className="device_name">{device.id}</p>
            <div className="icon_comp"></div>
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
