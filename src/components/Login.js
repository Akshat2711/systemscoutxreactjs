import React, { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import "./Login.css";

export const Login = () => {
  const [uniqueId, setUniqueId] = useState('');

  useEffect(() => {
    const getFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setUniqueId(result.visitorId);
    };

    getFingerprint();
  }, []);

  return (
    <div className='parent'>
        <div className='child'>
          <div className='username'>  <h1>Unique ID:{uniqueId}</h1></div>
          <div>
          </div>
          <div>
            <input placeholder="Enter Password!" type='password'></input>
          </div>
        </div>
    </div>
  );
};
