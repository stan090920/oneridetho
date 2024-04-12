import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

const Mobilesoc = () => {
    return (
        <>
           <div className="sm:hidden absolute bottom-20 w-full justify-center text-white ">
         <div className="text-center font-bold text-[24px]">Open 24/7</div>
        <div className="text-center text-[18px]">Safe, Affordable, and Reliable Rides</div>
        </div>
        <div className="flex items-center gap-10 pb-5  sm:hidden absolute bottom-0 w-full justify-center ">
        <a href="https://www.facebook.com/profile.php?id=100075942281898">
  <FaFacebook  size={30} className="text-white hover:text-blue-600" />
  </a>
  <a href="https://www.tiktok.com/@oneridetho?is_from_webapp=1&sender_device=pc">
  <FaTiktok  size={30} className="text-white hover:text-blue-600"/>
  </a>

  <a href="https://www.instagram.com/oneridetho242/">
  <FaInstagram size={30} className="text-white hover:text-blue-600" />
  </a>
      </div>
    
      </>
    );
}

export default Mobilesoc;