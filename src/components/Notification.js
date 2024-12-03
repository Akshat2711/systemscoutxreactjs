import React from 'react'
import './Notification.css';
export const Notification = (props) => {
  return (
    <div className='notimaindiv'>
        <p>"Akshat" want's you to be part of his dashboard</p>

        <button>
            <div>Accept</div>
        </button>

        <button onClick={props.ignorebtn}>
            <div>Ignore</div>
        </button>
    </div>
  )
}
