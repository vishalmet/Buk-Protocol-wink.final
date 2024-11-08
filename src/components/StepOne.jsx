import React, { useState, useEffect } from "react";
import axios from "axios";
import first from "../assets/updated/bg.png";
import buk from "../assets/updated/buk.png";
import step from "../assets/updated/step.png";
import step1 from "../assets/updated/step1.png";
import arrow from "../assets/updated/arrow.png";
import { BrowserProvider } from "ethers";

import { id } from "ethers";

const StepOne = ({ bookingData, onNavigate, onBack, setData, nftData }) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomImage, setRoomImage] = useState(null)
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(""); // Clear email error on input
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    if (phoneError) setPhoneError(""); // Clear phone error on input
  };


  useEffect(() => {
    const fetchBookingData = async () => {
      if (nftData) {
        try {
          const response = await axios.get(
            `https://api.polygon.dassets.xyz/v2/hotel/getNFTBooking?tokenId=${nftData}`
          );
          const data = response.data;
          console.log(data);

          const tokenID = nftData;


          if (data && data.status === true) {


            // Find the image with mainImage set to true and set roomImage
            const mainImage = data.data.booking.property.images.find(
              (image) => image.mainImage === true
            );
            if (mainImage) {
              setRoomImage(mainImage.hdUrl); // Set the roomImage to the hdUrl
              console.log(roomImage)
            }
          }
        } catch (error) {
          console.error("Error fetching NFT booking details:", error);
        }
      }
    };

    fetchBookingData();
  }, [nftData]);

  useEffect(() => {
    // Set initial values from bookingData
    if (bookingData) {
      setPropertyId(bookingData?.data.booking.property?._id || "");
      setUserInfo(bookingData?.data.userInfo || "");
      setCheckIn(formatDate(bookingData?.data.checkIn)); // Format check-in date
      setCheckOut(formatDate(bookingData?.data.checkOut)); // Format check-out date
    }
  }, [bookingData]);
  console.log(bookingData);
  const formatDate = (dateString) => {
    if (!dateString) return ""; // Return empty if no date is provided
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Get YYYY-MM-DD format
  };

  const fetchHotelData = async () => {
    const occupancyDetails = encodeURIComponent(
      JSON.stringify([{ paxes: [{ age: 21 }, { age: 20 }] }])
    );
    const url = `https://api.polygon.dassets.xyz/v2/hotel/getHotel?id=${propertyId}&occupancyDetails=${occupancyDetails}&checkIn=${checkIn}&checkOut=${checkOut}`;

    try {
      const response = await axios.get(url);
      console.log("Hotel data:", response.data);
      setData(response.data)
      //console.log(Data)

      // Handle or set the hotel data in state if needed
    } catch (error) {
      console.error("Error fetching hotel data:", error);
    }
  };

  useEffect(() => {
    console.log(checkIn, checkOut, propertyId, userInfo)
    if (propertyId && checkIn && checkOut) {
      fetchHotelData();
    }
  }, [propertyId, checkIn, checkOut]);
  // const TotalPrice = bookingData.data.listingDetails.price;
  // setTotalPrice(TotalPrice);
  // console.log('====================================');
  // console.log(TotalPrice);
  // console.log('====================================');

  // Function to validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };



  // Function to validate phone number (10-digit)
  const validatePhone = (phone) => {
    const phoneRegex = /^\+?\d{10}$/; // Optional + at the beginning, followed by exactly 10 digits
    return phoneRegex.test(phone);
  };

  // Function to handle the Next button click
  const handleNext = () => {
    let isValid = true;

    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Validate phone number
    if (!validatePhone(phone)) {
      setPhoneError("Invalid phone number (10 digits required)");
      isValid = false;
    } else {
      setPhoneError("");
    }

    // Proceed if all inputs are valid
    if (isValid) {
      fetchHotelData();
      onNavigate();
    }
  };

  // Handle key press for phone number input
  const handlePhoneKeyPress = (e) => {
    // Allow numbers, Backspace, and the + symbol
    if (!/[0-9+\-]/.test(e.key) && e.key !== "Backspace") {
      e.preventDefault();
    }
  };

  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [loginToken, setLoginToken] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getLoginMessage = (timestamp) => {
    return `Signature for login authentication: ${timestamp}`;
  };

  const handleAuth = async (address, signature, timestamp) => {
    try {
      const response = await fetch(
        "https://api.polygon.dassets.xyz/auth/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: address,
            loginToken: timestamp,
            signature: signature,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      const jwt = data.data.accessToken;
      console.log('====================================');
      console.log("signer res", data);
      console.log('====================================');

      if (!jwt) {
        throw new Error("JWT not found in the response");
      }

      // Store token in localStorage under "accessToken"
      localStorage.setItem("accessToken", jwt);
      setIsAuthenticated(true);

      return data;
    } catch (err) {
      console.error("Authentication error:", err);
      throw new Error(err.message || "Authentication failed");
    }
  };


  const connectAndSign = async () => {
    setIsConnecting(true);
    setError("");
    setSignature("");
    setLoginToken("");

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed!");
      }

      // Create provider and request accounts
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      // Get signer and address
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Create unix timestamp for login token
      const timestamp = Date.now();
      setLoginToken(timestamp.toString());

      // Sign message with timestamp
      const message = getLoginMessage(timestamp);
      const signedMessage = await signer.signMessage(message);
      setSignature(signedMessage);

      // Authenticate with the server
      await handleAuth(address, signedMessage, timestamp);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      // Optionally handle authentication failure
    } finally {
      setIsConnecting(false);
    }
  };

  const handleButtonClick = async () => {
    await connectAndSign(); // Wait for connection and signing to complete
    handleNext(); // Move to the next step after signing
  };

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    const storedPhone = sessionStorage.getItem("phone");

    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) setPhone(storedPhone);
  }, []);

  // Update sessionStorage whenever email or phone changes
  useEffect(() => {
    sessionStorage.setItem("email", email);
  }, [email]);

  useEffect(() => {
    sessionStorage.setItem("phone", phone);
  }, [phone]);

  // const shortenAddress = (address) => {
  //   if (!address) return "";
  //   return `${address.substring(0, 6)}...${address.substring(
  //     address.length - 4
  //   )}`;
  // };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="relative md:w-[500px] sm:w-[300px] bg-[#161616] shadow-lg p-2 flex flex-col items-center">
        {/* Background Image Division */}
        <div
          className="relative md:w-[485px] md:h-[230px] sm:h-[160px] sm:w-[295px] p-6 flex flex-col justify-between rounded-md border border-red-600/70 shadow-red-600/80 shadow-sm"
          style={{
            backgroundImage: `url(${roomImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="md:ml-[330px] sm:ml-[200px]">
            <img
              src={buk}
              alt="buk"
              className="md:w-[70px] w-[50px] md:ml-12 sm:ml-[20px]"
            />
          </div>
        </div>

        {/* Content Division */}
        <div className="bg-[#161616] w-full flex flex-col items-center sm:pt-1">
          {/* Progress Steps */}
          <div className="">
            <div className="flex">
              <div className="flex ml-[-15px]">
                <div className="text-white flex">
                  <img
                    src={step}
                    alt="step 1"
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2">
                    Step 1
                  </p>
                </div>
                <div className="bg-[#CA3F2A] h-[0.5px] md:w-[80px] sm:w-[50px] md:mt-4 sm:mt-3 md:ml-3 sm:ml-2"></div>
              </div>

              {/* Progress indicators */}
              <div className="flex ml-2">
                <div className="text-white flex">
                  <img
                    src={step1}
                    alt="step 2"
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2 text-[#B1B1B1]">
                    Step 2
                  </p>
                </div>
                <div className="bg-[#CA3F2A] h-[0.5px] md:w-[90px] sm:w-[50px] md:mt-4 sm:mt-3 md:ml-3 sm:ml-2"></div>
              </div>

              <div className="flex ml-2">
                <div className="text-white flex">
                  <img
                    src={step1}
                    alt="step 3"
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2 text-[#B1B1B1]">
                    Step 3
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col items-center sm:mt-3">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email address"
              className="border border-[#373737] bg-[#222222] sm:text-xs md:text-base rounded-md md:p-2  sm:py-1 mb-2 w-full focus:outline-none focus:ring-[0.5px] focus:ring-[#FFCACA] text-white text-center"
            />
            {emailError && <p className="text-red-500 text-xs">{emailError}</p>}

            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyPress}
              placeholder="Mobile number"
              className="border border-[#373737] bg-[#222222] sm:text-xs md:text-base rounded-md md:p-2 md:py-2 sm:py-1 mb-2 w-full focus:outline-none focus:ring-[0.5px] focus:ring-[#FFCACA] text-white text-center"
            />
            {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}

            <div className="flex w-full  md:mt-2 items-center justify-center pb-2">
              <img
                src={arrow}
                alt="arrow"
                className="md:w-9 md:h-9 sm:w-6 sm:h-6 mr-4 cursor-pointer"
                onClick={onBack}
              />
              <button
                className="bg-[#CA3F2A] sm:text-xs text-white md:px-[110px] sm:px-[68px] md:py-1 sm:py-1 rounded-md md:text-lg border-[#FFE3E3] border border-opacity-50"
                onClick={handleButtonClick} // Call the combined handler
                disabled={isConnecting}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOne;
