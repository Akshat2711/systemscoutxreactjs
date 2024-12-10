import React, { useEffect, useState } from 'react';
import { fetchSystemInfo } from './Api';
import './Main.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Discussion } from './Discussion.js';
import { Overlaydashboard } from './Overlaydashboard.js';

import { db } from '../firebase/firebase'; 
import { ref as dbRef, set, onValue, update } from "firebase/database";

import { Notification } from './Notification.js';

import { Requestdash } from './Requestdash.js';
import { Getlocation } from './Getlocation.js';


const Main = () => {
  const username = localStorage.getItem("user");
  const genAI = new GoogleGenerativeAI("AIzaSyCwIyE-xCxFunqmq65GmhS6VgKmY1Cpkfs"); // Replace with your actual API key
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const [dashVis, setDashVis] = useState(false);
  const [info, setInfo] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notivis,setnotivis]=useState(true);
  const [expandedchat,setexpandedchat]=useState(false);
  const[requestdash,setrequestdash]=useState(false);

  const friend_array=[];


/* 

  useEffect(() => {
    const generateContent = async () => {
      if (!info) return;

      const prompt = `
        Provide a summary of the provided specs, rate it on a scale of 1-10, and include some benchmark references.
        Specs: ${JSON.stringify(info, null, 2)}
      `;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text; // Access the generated text directly

        setAiSummary(responseText); // Update the state with the AI summary
        console.log(responseText); // Log for debugging
      } catch (error) {
        console.error("Error generating AI summary:", error);
      }
    };

    generateContent();
  }, [info]); 
 */


  useEffect(() => {
    if (expandedchat) {
      const ele = document.getElementsByClassName("chat-area-container")[0];
      const ele2 = document.getElementsByClassName("chat-input-area")[0];
      if (ele && ele2) {
        ele.style.height = "195vh";
        ele2.style.position = "fixed";
        ele2.style.bottom = "0";
        ele2.style.width = "98vw";
        ele2.style.height = "5vh";
        ele2.style.marginBottom = "2px"; 
      }
    }
  }, [expandedchat]);
  



  useEffect(() => {
    const getData = async () => {
      try {
        // Retrieve the user's location
        const location_user = await Getlocation(); // Await the promise
  
        // Fetch the logged-in user's system info
        const data = await fetchSystemInfo();
        setInfo(data);
  
        // Save current user's info to Firebase
        const timestamp = Date.now();
        const msgRef = dbRef(db, `systemscoutpcinfo/${username}`);
        const messageData = {
          user: username,
          timestamp: timestamp,
          message: data || '',
          long: location_user.latitude, // Properly assign latitude
          lati: location_user.longitude, // Properly assign longitude
        };
  
        await update(msgRef, messageData);
        console.log("Data updated successfully");
      } catch (error) {
        console.error('Failed to fetch data or update Firebase:', error);
      }
    };
  
    const fetchUsersData = () => {
      const usersRef = dbRef(db, 'systemscoutpcinfo');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const usersArray = Object.keys(data).map((key) => ({
            username: key,
            info: data[key].message,
          }));
  
          // Fetch friend list and filter usersData
          const newRef = dbRef(db, `systemscoutpcinfo/${username}/friends`);
          onValue(newRef, (friendsSnapshot) => {
            const friendsData = friendsSnapshot.val();
            const friendArray = Object.values(friendsData || {}).map((friend) => friend.name);
  
            const filteredUsers = usersArray.filter((user) => friendArray.includes(user.username));
            setUsersData(filteredUsers);
          });
        }
      });
    };
  
    getData();
    fetchUsersData();
  }, []);
  
  

  // Handle user button click
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setDashVis(true);
  };

  const rotation = info ? (info.battery.percent / 100) * 360 : 0;

  return (
    <div className='maindiv'>
      

{/* notification */}
      {(notivis) &&<Notification ignorebtn={()=>setnotivis(false)}/>}

{/* requestdash */}
{(requestdash) && <Requestdash/>}


{/* dashboard */}
      {dashVis && (
        <Overlaydashboard
          userInfo={selectedUser}
          onClose={() => setDashVis(false)}
        />
      )}

{/* expand chat functionality */}
{(expandedchat)&&
<div className='expandedchat'>
  <button className='closechatbtn' onClick={()=>{setexpandedchat(false)}}>x</button>
  <Discussion/>
</div>
}


      <div className='mainbox'>
        <div className='sidebar'>
          <div className='smallbox'>
            <h2>CPU</h2>
            <p>Physical Cores:<span className='highlight_specs'> {info?.cpu.physical_cores}</span></p>
            <p>Total Cores: <span className='highlight_specs'>{info?.cpu.total_cores}</span></p>
            <p>Frequency: <span className='highlight_specs'>{info?.cpu.frequency.current} MHz</span></p>
            <p>Usage: <span className='highlight_specs'>{info?.cpu.usage}%</span></p>
          </div>
          <div className='smallbox'>
            <h2>Memory</h2>
            <p>Total: <span className='highlight_specs'>{(info?.memory.total / 1e9).toFixed(2)} GB</span></p>
            <p>Used: <span className='highlight_specs'>{(info?.memory.used / 1e9).toFixed(2)} GB</span></p>
            <p>Free: <span className='highlight_specs'>{(info?.memory.free / 1e9).toFixed(2)} GB</span></p>
            <p>Usage:<span className='highlight_specs'> {info?.memory.percent}%</span></p>
          </div>
          <div className="smallbox" id="osinfo">
            <h1>OS</h1>
            <p>{`${info?.os.system} ${info?.os.release} (Version: ${info?.os.version}) -`}<span className='highlight_specs'>{` ${info?.os.processor}`}</span></p>
          </div>
          <div className="smallbox" id="gpuinfo">
            <h2>GPU</h2>
            <p>Name: <span className='highlight_specs'>{info?.gpu[0].name}</span></p>
            <p>Load: <span className='highlight_specs'>{info?.gpu[0].load}</span></p>
            <p>Memory Total:<span className='highlight_specs'> {info?.gpu[0].memory_total}</span></p>
            <p>Memory Used: <span className='highlight_specs'>{info?.gpu[0].memory_used}</span></p>
            <p>Memory Free: <span className='highlight_specs'>{info?.gpu[0].memory_free}</span></p>
            <p>Temperature: <span className='highlight_specs'>{info?.gpu[0].temperature}</span></p>
          </div>
        </div>

        <div className='middlearea'>
          <div className='aibox'>
            <h1>AI Summary</h1>
            <p>{aiSummary || "Generating AI summary..."}</p>
          </div>
        </div>

        <div className='bottomarea'>
          <div className='bottombar'>
            {usersData.map((user) => (
              <button
                key={user.username}
                className='bottombutton'
                onClick={() => handleUserClick(user)}
              >
                <div className='bottombox'>
                  <p>{user.username}</p>
                </div>
              </button>
            ))}

            <button className='bottombutton' onClick={()=>{setrequestdash(true)}} >
            <div id="adduser">
            </div>
            </button>
          </div>
        </div>


    

        <div className='rightarea'>
          <div className='rightboxbig'>
            <h2>Battery</h2>
            <p>Charge: <span className='highlight_specs'>{info?.battery.percent}%</span></p>
            <p>Power Plugged: <span className='highlight_specs'>{info?.battery.power_plugged ? 'Yes' : 'No'}</span></p>
            <div className="circle-wrap">
              <div className="circle">
                <div className="mask full">
                  <div
                    className="fill"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                    }}
                  ></div>
                </div>
                <div className="inside-circle">{info?.battery.percent}%</div>
              </div>
            </div>
          </div>
          <div className='rightbox'>
            <h2>Disk</h2>
            <p>Total: <span className='highlight_specs'>{(info?.disk.usage[0].total / 1e12).toFixed(2)} TB</span></p>
            <p>Used: <span className='highlight_specs'>{(info?.disk.usage[0].used / 1e12).toFixed(2)} TB</span></p>
            <p>Free: <span className='highlight_specs'>{(info?.disk.usage[0].free / 1e12).toFixed(2)} TB</span></p>
            <p>Usage: <span className='highlight_specs'>{info?.disk.usage[0].percent}%</span></p>
          </div>
        </div>

        <div className='chatarea'>
        <button className='expandchatbtn' onClick={()=>{setexpandedchat(true)}}>⛶</button>
          <h1>Chat</h1>
          <Discussion />
        </div>
      </div>
    </div>
  );
};

export default Main;
