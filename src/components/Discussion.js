import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase/firebase'; 
import { ref as dbRef, set, push, onValue } from "firebase/database";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FiSend } from 'react-icons/fi'; 
import { RiImageAddFill } from 'react-icons/ri'; 
import "./Discussion.css";

export const Discussion = () => {
    const username = "akshat";
    const [showfullimg, setshowfullimg] = useState(false);
    const [fullimgsrc, setfullimgsrc] = useState("");
    const [users, setusers] = useState([]);
    const [selectedgroup, setSelectedgroup] = useState('nonselecteduser');
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const msgRef = dbRef(db, 'systemscoutxreact/');
        onValue(msgRef, (snapshot) => {
            const data = snapshot.val();
            const loadedMessages = [];
            const newUsers = new Set(users);

            for (let id in data) {
                const { msgfrom, msgto, user } = data[id];
                newUsers.add(user);

                if (msgto === selectedgroup || msgfrom === selectedgroup) {
                    loadedMessages.push({ id, ...data[id] });
                }
            }

            setusers(Array.from(newUsers));
            loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
            setMessages(loadedMessages);
        });
    });

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSendMessage = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (message.trim() || image) {
                const timestamp = Date.now();
                const msgRef = dbRef(db, 'systemscoutxreact/');
                const newMessageRef = push(msgRef);

                const messageData = {
                    user: username,
                    timestamp: timestamp,
                    msgto: selectedgroup,
                    msgfrom: username,
                    message: message || '',
                    imageUrl: '',
                };

                if (image) {
                    const imgRef = storageRef(storage, `images/${image.name}_${timestamp}`);
                    const uploadTask = uploadBytesResumable(imgRef, image);

                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {},
                        (error) => {
                            console.error("Image upload error:", error);
                        },
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                messageData.imageUrl = downloadURL;
                                set(newMessageRef, messageData).then(() => {
                                    setMessage('');
                                    setImage(null);
                                });
                            });
                        }
                    );
                } else {
                    set(newMessageRef, messageData).then(() => {
                        setMessage('');
                    }).catch((error) => {
                        console.error("Error sending message: ", error);
                    });
                }
            }
        }
    };

    return (
        <div className="chat-area-container">
            <div className="messages-container">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message-bubble ${msg.msgfrom === username ? "sent" : "received"}`}
                    >
                        <strong className="message-sender" style={{color:"black"}}>{msg.msgfrom}</strong>
                        {msg.message && <div className="message-text">{msg.message}</div>}
                        <br></br>
                        {msg.imageUrl && (
                            
                            <button
                                onClick={() => {
                                    setshowfullimg(true);
                                    setfullimgsrc(msg.imageUrl);
                                }}
                                className="image-preview"
                            >
                                <img src={msg.imageUrl} alt="Uploaded" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {showfullimg && (
                <div className="full-image-modal" onClick={() => setshowfullimg(false)}>
                    <img
                        src={fullimgsrc}
                        alt="Full View"
                        className="modal-image"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <div className="chat-input-area">
                <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageUpload"
                />
                <label htmlFor="imageUpload" className="upload-button">
                    <RiImageAddFill size={24} />
                </label>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleSendMessage}
                    className="message-input"
                />
                <button onClick={handleSendMessage} className="send-button">
                    <FiSend size={24} />
                </button>
            </div>
        </div>
    );
};
