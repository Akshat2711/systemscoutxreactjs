import React, { useEffect, useState } from 'react';
import { fetchSystemInfo } from './Api';
import './Main.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Discussion } from './Discussion.js';
import { Overlaydashboard } from './Overlaydashboard.js';
import { db } from '../firebase/firebase'; 
import { ref as dbRef, set, onValue } from "firebase/database";
import { Notification } from './Notification.js';

const Main = () => {
  const username = "meet";
  const genAI = new GoogleGenerativeAI("AIzaSyCwIyE-xCxFunqmq65GmhS6VgKmY1Cpkfs"); // Replace with your actual API key
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const [dashVis, setDashVis] = useState(false);
  const [info, setInfo] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notivis,setnotivis]=useState(true);


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
    // Fetch the logged-in user's system info
    const getData = async () => {
      try {
        const data = await fetchSystemInfo();
        setInfo(data);

        // Save current user's info to Firebase
        const timestamp = Date.now();
        const msgRef = dbRef(db, `systemscoutpcinfo/${username}`);
        const messageData = {
          user: username,
          timestamp: timestamp,
          message: data || '',
        };

        await set(msgRef, messageData);
        console.log("Data updated successfully");
      } catch (error) {
        console.error('Failed to fetch system info:', error);
      }
    };

    getData();

    // Fetch all users' system info from Firebase
    const usersRef = dbRef(db, 'systemscoutpcinfo');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map((key) => ({
          username: key,
          info: data[key].message,
        }));
        setUsersData(usersArray);
      }
    });
  }, []);

  // Handle user button click
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setDashVis(true);
  };

  const rotation = info ? (info.battery.percent / 100) * 360 : 0;

  return (
    <div className='maindiv'>

      {(notivis) &&<Notification ignorebtn={()=>setnotivis(false)}/>}




      {dashVis && (
        <Overlaydashboard
          userInfo={selectedUser}
          onClose={() => setDashVis(false)}
        />
      )}

      <div className='mainbox'>
        <div className='sidebar'>
          <div className='smallbox'>
            <h2>CPU</h2>
            <p>Physical Cores: {info?.cpu.physical_cores}</p>
            <p>Total Cores: {info?.cpu.total_cores}</p>
            <p>Frequency: {info?.cpu.frequency.current} MHz</p>
            <p>Usage: {info?.cpu.usage}%</p>
          </div>
          <div className='smallbox'>
            <h2>Memory</h2>
            <p>Total: {(info?.memory.total / 1e9).toFixed(2)} GB</p>
            <p>Used: {(info?.memory.used / 1e9).toFixed(2)} GB</p>
            <p>Free: {(info?.memory.free / 1e9).toFixed(2)} GB</p>
            <p>Usage: {info?.memory.percent}%</p>
          </div>
          <div className="smallbox" id="osinfo">
            <h1>OS</h1>
            <p>{`${info?.os.system} ${info?.os.release} (Version: ${info?.os.version}) - ${info?.os.processor}`}</p>
          </div>
          <div className="smallbox" id="gpuinfo">
            <h2>GPU</h2>
            <p>Name: {info?.gpu[0].name}</p>
            <p>Load: {info?.gpu[0].load}</p>
            <p>Memory Total: {info?.gpu[0].memory_total}</p>
            <p>Memory Used: {info?.gpu[0].memory_used}</p>
            <p>Memory Free: {info?.gpu[0].memory_free}</p>
            <p>Temperature: {info?.gpu[0].temperature}</p>
          </div>
        </div>

        <div className='middlearea'>
          <div className='aibox'>
            <h1>AI Summary</h1>
            <p>{aiSummary || "Generating AI summary..."}</p>
          </div>
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

            <button className='bottombutton'>
            <div id="adduser">
            </div>
            </button>
          </div>
        </div>

        <div className='rightarea'>
          <div className='rightboxbig'>
            <h2>Battery</h2>
            <p>Charge: {info?.battery.percent}%</p>
            <p>Power Plugged: {info?.battery.power_plugged ? 'Yes' : 'No'}</p>
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
            <p>Total: {(info?.disk.usage[0].total / 1e12).toFixed(2)} TB</p>
            <p>Used: {(info?.disk.usage[0].used / 1e12).toFixed(2)} TB</p>
            <p>Free: {(info?.disk.usage[0].free / 1e12).toFixed(2)} TB</p>
            <p>Usage: {info?.disk.usage[0].percent}%</p>
          </div>
        </div>

        <div className='chatarea'>
          <h1>Chat</h1>
          <Discussion />
        </div>
      </div>
    </div>
  );
};

export default Main;
