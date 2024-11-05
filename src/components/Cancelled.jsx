import React, {useState, useEffect} from 'react'
import first from '../assets/updated/bg.png';
import buk from '../assets/updated/buk.png';
import error from '../assets/updated/error.png'
import axios from "axios";


const Cancelled = ({nftData}) => {

  const [roomImage, setRoomImage] = useState(null);


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

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="relative md:w-[500px] md:h-[500px] h-fit sm:w-[300px] bg-[#161616] shadow-lg p-2 flex flex-col items-center">
        <div
          className="relative md:w-[485px] md:h-[230px] sm:h-[120px] sm:w-[280px] p-6 flex flex-col justify-between rounded-md border border-red-600/70 shadow-red-600/80 shadow-sm"
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
              className="md:w-[70px] w-[50px] md:ml-12 sm:ml-[20px]"
            />
          </div>

          {/* content */}
          <div className=" md:mt-48 sm:mt-24 items-center justify-center flex flex-col text-center">
            <img
              src={error}
              alt=""
              className="md:w-16 md:h-16 sm:h-12 sm:w-12"
            />

            <h2 className="text-white md:text-lg sm:text-sm md:mt-5 sm:mt-3">
              Oops! Booking resold. <br />
              Check our marketplace for more deals!
            </h2>

            <a
              href="https://polygon.dassets.xyz/hotels/marketplace"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#CA3F2A] text-white md:px-[40px] md:mt-8 sm:px-[30px] sm:mt-2 py-1 rounded-md md:text-lg sm:text-xs border-[#FFE3E3] border border-opacity-50   "
            >
              More Deals
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cancelled