import React, { useState, useEffect } from "react";
import first from "../assets/updated/bg.png";
import buk from "../assets/updated/buk.png";
import step from "../assets/updated/step.png";
import arrow from "../assets/updated/arrow.png";
import step2 from "../assets/updated/step2.png";
import { buyRoom } from "../ContractIntegration";
import axios from "axios";
import SucessConfirmation from "./SucessConfirmation";
import Cancelled from "./Cancelled";

const StepThree = ({ onNavigate, onBack, totalPrice, tokenID, nftData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const _tokenId = tokenID;
  const [roomImage, setRoomImage] = useState(null);
const [bookingData, setBookingData] = useState(null);
const [navigateTo, setNavigateTo] = useState(null); // New navigation state


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
             setBookingData(data);
            // Find the image with mainImage set to true and set roomImage
            const mainImage = data.data.booking.property.images.find(
              (image) => image.mainImage === true
            );
            if (mainImage) {
              setRoomImage(mainImage.hdUrl); // Set the roomImage to the hdUrl
              console.log(roomImage);
            }
          }
        } catch (error) {
          console.error("Error fetching NFT booking details:", error);
        }
      }
    };

    fetchBookingData();
  }, [nftData]);

    const checkInDate = bookingData?.data?.checkIn
      ? new Date(bookingData.data.checkIn)
      : null;
    const formattedDateCheckIn = checkInDate
      ? `${checkInDate.getDate().toString().padStart(2, "0")}-${(
          checkInDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${checkInDate.getFullYear()}`
      : "";

    const checkOutDate = bookingData?.data?.checkOut
      ? new Date(bookingData.data.checkOut)
      : null;
    const formattedDateCheckOut = checkOutDate
      ? checkOutDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "";

      const handleBuyRoom = async () => {
        setIsLoading(true);
        console.log("Processing...");
        if (_tokenId) {
          try {
            await buyRoom(_tokenId);
            setNavigateTo("success"); // Update navigateTo based on successful outcome
          } catch (error) {
            console.error("Error executing buyRoom:", error);
            setNavigateTo("resold"); // Update navigateTo for error case
          } finally {
            setIsLoading(false);
          }
        } else {
          console.error("Token ID is not set");
          setIsLoading(false);
        }
      };
    
      const handleBuyRoomClick = async () => {
        await handleBuyRoom(); // Executes buyRoom and updates navigateTo based on outcome
      };
    
      // Conditional redirection based on navigateTo state
      if (navigateTo === "success") {
        return <div><SucessConfirmation nftData={nftData} /></div>; // Replace with your success component
      } else if (navigateTo === "resold") {
        return <div><Cancelled nftData={nftData} /></div>; // Replace with your error/resold component
      }

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="relative md:w-[500px] md:h-[500px] sm:h-[350px] sm:w-[350px] bg-[#161616] shadow-lg p-2 flex flex-col items-center">
        <div
          className="relative md:w-[485px] md:h-[230px] sm:h-[160px] sm:w-[335px] p-6 flex flex-col justify-between rounded-md border border-red-600/70 shadow-red-600/80 shadow-sm"
          style={{
            backgroundImage: `url(${roomImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="md:ml-[330px] sm:ml-[200px]">
            <img
              src={buk}
              alt=""
              className="md:w-[70px] w-[50px] md:ml-12 sm:ml-[35px]"
            />
          </div>

          <div className="md:mt-48 sm:mt-32">
            <div className="flex">
              <div className="flex ml-[-15px]">
                <div className="text-white flex">
                  <img
                    src={step2}
                    alt=""
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2">
                    Step 1
                  </p>
                </div>
                <div className="bg-[#CA3F2A] h-[0.5px] md:w-[80px] sm:w-[50px] md:mt-4 sm:mt-3 md:ml-3 sm:ml-2"></div>
              </div>

              <div className="flex ml-2">
                <div className="text-white flex">
                  <img
                    src={step2}
                    alt=""
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2">
                    Step 2
                  </p>
                </div>
                <div className="bg-[#CA3F2A] h-[0.5px] md:w-[80px] sm:w-[50px] md:mt-4 sm:mt-3 md:ml-3 sm:ml-2"></div>
              </div>

              <div className="flex ml-2">
                <div className="text-white flex">
                  <img
                    src={step}
                    alt=""
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2">
                    Step 3
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:mt-9 sm:mt-5">
              <p className="text-center text-white md:text-sm sm:text-xs font-light md:mb-5 sm:mb-1">
                You're purchasing Superior room at the{" "}
                {bookingData?.data?.booking?.property?.address?.address ||
                  "unknown address"}
                ,{" "}
                {bookingData?.data?.booking?.property?.address?.city ||
                  "unknown city"}
                ,{" "}
                {bookingData?.data?.booking?.property?.address?.country ||
                  "unknown country"}{" "}
                from <br />
                {formattedDateCheckIn} to {formattedDateCheckOut} <br /> for
                USDC {totalPrice} for 2 guests.
              </p>

              <div className="flex w-full items-center justify-center pb-2 sm:mt-5">
                <img
                  src={arrow}
                  alt=""
                  className="md:w-9 md:h-9 sm:w-6 sm:h-6 mr-4 cursor-pointer"
                  onClick={onBack}
                />
                <button
                  className="bg-[#CA3F2A] sm:text-xs text-white md:px-[110px] sm:px-[68px] md:py-1 sm:py-1 rounded-md md:text-lg border-[#FFE3E3] border border-opacity-50"
                  onClick={handleBuyRoomClick}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThree;