import { useAppStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from 'react-icons/io5';
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ADD_PROFILE_IMAGE_ROUTE, HOST, REMOVE_PROFILE_IMAGE_ROUTE, UPDATE_PROFILE_ROUTE } from "@/utils/constants";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if(userInfo.profileSetup){
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if(userInfo.image){
      setImage(`${HOST}/${userInfo.image}`);
    }
  }, [userInfo]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        saveChanges();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [firstName, lastName, selectedColor]);

  const validateProfile = () => {
    if(!firstName){
      toast.error("First name is required.");
      return false;
    }
    if(!lastName){
      toast.error("Last name is required.");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if(validateProfile()){
      try {
        const response = await apiClient.post(UPDATE_PROFILE_ROUTE,{firstName,lastName,color:selectedColor},{withCredentials:true});
        if(response.status === 200 && response.data){
          setUserInfo({...response.data});
          toast.success("Profile updated successfully.");
          navigate("/chat");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleNavigate = () => {
    if(userInfo.profileSetup){
      navigate("/chat");
    } else {
      toast.error("Please setup your profile.");
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async(event) => {
    const file = event.target.files[0];
    if(file){
      const formData = new FormData();
      formData.append("profile-image",file);
      const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE,formData,{withCredentials:true});
      if(response.status === 200 && response.data.image){
        setUserInfo({...userInfo,image:response.data.image});
        toast.success("Image updated successfully.");
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
        const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
            withCredentials: true
        });
        
        if (response.status === 200) {
            if (response.data.user) {
                setUserInfo(response.data.user);
            } else {
                setUserInfo({ ...userInfo, image: null });
            }
            toast.success("Image removed successfully.");
            setImage(null);
        }
    } catch (error) {
        console.error("Error removing profile image:", error);
        toast.error("Failed to remove profile image. Please try again.");
    }
  };

  return (
    <div className="bg-[#1b1c24] min-h-screen w-full flex items-center justify-center p-4">
      <div className="flex flex-col gap-6 w-full max-w-2xl">
        <div onClick={handleNavigate}>
          <IoArrowBack className="text-3xl sm:text-4xl lg:text-5xl text-white/90 cursor-pointer" />
        </div>
        
        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Avatar Section */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <Avatar className="w-full h-full rounded-full overflow-hidden">
                {image ? (
                  <AvatarImage src={image} alt="profile" className="object-cover w-full h-full bg-black" />
                ) : (
                  <div className={`uppercase w-full h-full text-2xl sm:text-3xl md:text-4xl border flex items-center justify-center rounded-full ${getColor(selectedColor)}`}>
                    {firstName ? firstName.charAt(0) : userInfo.email.charAt(0)}
                  </div>
                )}
              </Avatar>
              {hovered && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
                  onClick={image ? handleDeleteImage : handleFileInputClick}
                >
                  {image ? 
                    <FaTrash className="text-white text-xl sm:text-2xl md:text-3xl" /> : 
                    <FaPlus className="text-white text-xl sm:text-2xl md:text-3xl" />
                  }
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageChange} 
                name="profile-image" 
                accept=".png,.jpg,.jpeg,.svg,.webp" 
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="flex flex-col gap-4 w-full">
            <Input
              placeholder="Email"
              type="email"
              disabled
              value={userInfo.email}
              className="rounded-lg p-4 sm:p-5 bg-[#2c2e3b] border-none"
            />
            <Input
              placeholder="First Name"
              type="text"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              className="rounded-lg p-4 sm:p-5 bg-[#2c2e3b] border-none"
            />
            <Input
              placeholder="Last Name"
              type="text"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              className="rounded-lg p-4 sm:p-5 bg-[#2c2e3b] border-none"
            />
            
            {/* Color Selection */}
            <div className="flex flex-wrap gap-3">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`${color} h-6 w-6 sm:h-8 sm:w-8 rounded-full cursor-pointer transition-all duration-300
                    ${selectedColor === index ? "ring-2 ring-white ring-offset-2 ring-offset-[#1b1c24]" : ""}`}
                  onClick={() => setSelectedColor(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          className="h-12 sm:h-14 w-full bg-purple-700 hover:bg-purple-800 transition-all duration-300 mt-4" 
          onClick={saveChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Profile;
