import React, { useState, useEffect } from "react";
import { Getlocation } from "./Getlocation";
import { db } from "../firebase/firebase";
import { ref as dbRef, set, onValue } from "firebase/database";

export const Nearbydetect = () => {
  const [nearbyComputers, setNearbyComputers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get the user's current location
    Getlocation()
      .then((location) => {
        
        setUserLocation(location); // Store user location
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (userLocation) {
      const msgRef = dbRef(db, `systemscoutpcinfo`)

      onValue(msgRef, (snapshot) => {
        const data = snapshot.val();
        const filteredComputers = [];

        for (let id in data) {
          const { long, lati } = data[id];
          const distance = calculateDistance(

           /*  i guess instead of current latitude i was getting long sources
            will replace in future right now just switched there position */

            userLocation.longitude,
            userLocation.latitude,
            lati,
            long
          );

          if (distance <= 10000) {
            filteredComputers.push({ id, ...data[id], distance });
          }
        }

        setNearbyComputers(filteredComputers);
      });
    }
  }, [userLocation]);

  console.log(nearbyComputers);

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  return nearbyComputers;
};
