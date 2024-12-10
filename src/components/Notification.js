import React, { useEffect, useState } from 'react';
import './Notification.css';
import { db } from '../firebase/firebase'; 
import { ref as dbRef, onValue,push, remove } from "firebase/database";

export const Notification = (props) => {
  const username = localStorage.getItem('user');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [reqPending, setReqPending] = useState(false);
  const [seeReq, setSeeReq] = useState(false);

  useEffect(() => {
    if (!username) return;

    const msgRef = dbRef(db, `systemscoutpcinfo/${username}/pendingreq`);

    const unsubscribe = onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      const requests = [];
      if (data) {
        for (let id in data) {
          requests.push(data[id]);
        }
      }
      setPendingRequests(requests);
      setReqPending(requests.length > 0);
    });

    return () => unsubscribe();
  }, [username]);




const addfriend=(sender_name)=>{
  //adds friends to the account who accepted it
  const add_reciever_Ref=dbRef(db,`systemscoutpcinfo/${username}/friends`);
  push(add_reciever_Ref,{name:sender_name})
  //adds friends to account who sended it
  const add_sender_Ref=dbRef(db,`systemscoutpcinfo/${sender_name}/friends`);
  push(add_sender_Ref,{name:username})

  //to delete the request pending in my comp
  const remove_req_ref=dbRef(db,`systemscoutpcinfo/${username}/pendingreq`)
  onValue(remove_req_ref,(snapshot)=>{
    const data =snapshot.val();

    for(let id in data){
      if(data[id].name === sender_name){
        const remove_path=dbRef(db,`systemscoutpcinfo/${username}/pendingreq/${id}`);
        remove(remove_path);
      }
    }
    
  
  })

   //to delete the request pending in other comp if both send request
   const remove_req_ref_other=dbRef(db,`systemscoutpcinfo/${sender_name}/pendingreq`)
   onValue(remove_req_ref_other,(snapshot)=>{
     const data =snapshot.val();
 
     for(let id in data){
       if(data[id].name === username){
         const remove_path=dbRef(db,`systemscoutpcinfo/${sender_name}/pendingreq/${id}`);
         remove(remove_path);
       }
     }
     
   
   })
  
}




  const handleLookClick = () => {
    setSeeReq(true);
  };

  const handleIgnoreClick = () => {
    setSeeReq(false);
    props.ignorebtn();
  };

  return reqPending ? (
    <div className="notimaindiv">
      {seeReq ? (
        <>
          <h1>Pending Requests</h1>
          <ul>
            {pendingRequests.map((req, index) => (
              <>
                <li key={index}>{req.name || `Request ${index + 1}`}</li>
                <button className='acceptbtn' onClick={()=>{addfriend(req.name)}}>Accept</button>
                <h2>_______________________________</h2>
              </>
            ))}
          </ul>
          <button onClick={handleIgnoreClick} style={{backgroundColor:"transparent",border:"none"}}>
            <center><div className='hiddenicon'></div></center>
          </button>
        </>
      ) : (
        <>
          <p>You have a new friend request!</p>
          <button onClick={handleLookClick} id="lookbtn">
            <div>Look</div>
          </button>
          <button onClick={handleIgnoreClick} id="ignorebtn">
            <div>Ignore</div>
          </button>
        </>
      )}
    </div>
  ) : null;
};
