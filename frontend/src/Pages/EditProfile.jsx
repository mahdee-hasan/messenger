import React, { useState } from "react";
import { ClipLoader } from "react-spinners";

//imports from shad-cn
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaBirthdayCake, FaCalendar } from "react-icons/fa";
import { Calendar } from "@/components/ui/calendar";

import { MdCake, MdEdit, MdLocationPin, MdWeb } from "react-icons/md";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { format } from "date-fns";
import useChatStore from "@/stores/chatStore";

const EditProfile = ({ user }) => {
  //for name
  const [usersVisibleName, setUsersVisibleName] = useState(user.name);
  const [passwordForUpdate, setPasswordForUpdate] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [birthday, setBirthday] = useState(user.dob || null);
  const [userLocation, setUserLocation] = useState(user.location || "");
  const [web, setWeb] = useState(user.website || "");
  const [updatingError, setUpdatingError] = useState(null);

  const setMsg = useChatStore((s) => s.setPopUpMessage);
  const handleNameUpdate = async () => {
    try {
      const bodyObject = {
        name: usersVisibleName,
        password: passwordForUpdate,
      };

      setIsUpdating(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/update-name`,
        {
          method: "PUT",
          body: JSON.stringify(bodyObject),
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400) {
          setIsUpdating(false);

          setUpdatingError(data.errors);
        } else {
          throw new Error(data.errors.common || "error here");
        }
      }
      if (data.success) {
        setIsUpdating(false);
        setIsUpdated(true);
        setMsg(data.message);
        setUser((prev) => ({
          ...prev,
          name: usersVisibleName,
        }));
      }
    } catch (error) {
      setIsUpdating(false);
      setMsg(error.message);
      console.log(error.message);
    }
  };
  const handleDobUpdate = async () => {
    try {
      const bodyObject = {
        dob: birthday.toISOString(),
        password: passwordForUpdate,
      };

      setIsUpdating(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/update-dob`,
        {
          method: "PUT",
          body: JSON.stringify(bodyObject),
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400) {
          setIsUpdating(false);

          setUpdatingError(data.errors);
        } else {
          throw new Error(data.errors.common || "error here");
        }
      }
      if (data.success) {
        setIsUpdating(false);
        setIsUpdated(true);
        setMsg(data.message);
      }
    } catch (error) {
      setIsUpdating(false);
      setMsg(error.message);
      console.log(error.message);
    }
  };
  const handleLocationUpdate = async () => {
    try {
      const bodyObject = {
        location: userLocation,
        password: passwordForUpdate,
      };

      setIsUpdating(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/update-location`,
        {
          method: "PUT",
          body: JSON.stringify(bodyObject),
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400) {
          setIsUpdating(false);

          setUpdatingError(data.errors);
        } else {
          throw new Error(data.errors.common || "error here");
        }
      }
      if (data.success) {
        setIsUpdating(false);
        setIsUpdated(true);
        setMsg(data.message);
      }
    } catch (error) {
      setIsUpdating(false);
      setMsg(error.message);
      console.log(error.message);
    }
  };
  const handleWebsiteUpdate = async () => {
    try {
      const bodyObject = {
        website: web,
        password: passwordForUpdate,
      };

      setIsUpdating(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/update-website`,
        {
          method: "PUT",
          body: JSON.stringify(bodyObject),
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400) {
          setIsUpdating(false);

          setUpdatingError(data.errors);
        } else {
          throw new Error(data.errors.common || "error here");
        }
      }
      if (data.success) {
        setIsUpdating(false);
        setIsUpdated(true);
        setMsg(data.message);
      }
    } catch (error) {
      setIsUpdating(false);
      setMsg(error.message);
      console.log(error.message);
    }
  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="w-50 mx-auto h-12 p-4"> Edit about info </div>
      {/* for changing name */}
      <div className="flex flex-col">
        <label className="bg-gray-300 w-full px-2">name:</label>
        <div className="flex justify-between p-4 ">
          <p>{user.name}</p>
          <Dialog>
            <DialogTrigger asChild className="cursor-pointer">
              <MdEdit />
            </DialogTrigger>{" "}
            <DialogContent className="sm:max-w-[425px]">
              {isUpdated ? (
                <DialogTitle className="text-center p-2">
                  name updated to{" "}
                  <span className="bg-gray-200 p-1 px-2 text-2xl rounded-xl">
                    {usersVisibleName}
                  </span>
                  <DialogDescription>
                    you cant change name before 48 hours{" "}
                  </DialogDescription>
                </DialogTitle>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit name </DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="name-1">change name :</Label>
                      <Input
                        required
                        id="name-1"
                        name="name"
                        defaultValue={usersVisibleName}
                        onChange={(e) => setUsersVisibleName(e.target.value)}
                      />
                      {updatingError?.name && (
                        <p className="text-red-400 text-sm mb-2">
                          {updatingError?.name.msg}
                        </p>
                      )}
                    </div>
                    <div className="">
                      <Label
                        htmlFor="password-1"
                        className="grid gap-3 relative"
                      >
                        enter password :{" "}
                        <Input
                          required
                          id="password-1"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          defaultValue={passwordForUpdate}
                          onChange={(e) => setPasswordForUpdate(e.target.value)}
                        />
                        <div className="absolute right-3 h-full cursor-pointer flex items-center top-3 ">
                          {showPassword ? (
                            <FaRegEyeSlash
                              onClick={() => setShowPassword(false)}
                            />
                          ) : (
                            <FaRegEye
                              onClick={() => setShowPassword(true)}
                              className=""
                            />
                          )}
                        </div>
                      </Label>

                      {updatingError?.password && (
                        <p className="text-red-400 text-sm mb-2">
                          {updatingError?.password.msg}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </>
              )}

              {isUpdating ? (
                <Button>
                  <ClipLoader size={15} loading={true} color="gray" />
                </Button>
              ) : isUpdated ? (
                <DialogClose>
                  <Button
                    className="w-full cursor-pointer"
                    onClick={() => {
                      setIsUpdated(false);
                    }}
                  >
                    go back
                  </Button>
                </DialogClose>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="cursor-pointer w-full"
                      disabled={!passwordForUpdate || !usersVisibleName}
                    >
                      Save changes
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Update</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to update your <b>Name</b> to{" "}
                        {usersVisibleName}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleNameUpdate}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* for changing birthday */}
      <div className="flex flex-col">
        <label className="bg-gray-300 w-full px-2 flex gap-2 items-center ">
          <MdCake /> Birthday:
        </label>
        <div className="flex justify-between p-4 ">
          <p>
            {user.dob ? format(user.dob, "dd MMMM yyyy (EEEE)") : "not set yet"}
          </p>
          <Dialog>
            <DialogTrigger asChild className="cursor-pointer">
              <MdEdit />
            </DialogTrigger>{" "}
            <DialogContent className="sm:max-w-[425px]">
              {isUpdated ? (
                <DialogTitle className="text-center p-2">
                  birthday updated to{" "}
                  <span className="bg-gray-200 p-1 px-2 text-2xl rounded-xl">
                    {format(birthday, "dd MMMM yyyy (EEEE)")}
                  </span>
                  <DialogDescription>
                    you cant change birthday before 48 hours{" "}
                  </DialogDescription>
                </DialogTitle>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Birthday</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="name-1">change Birthday :</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            data-empty={!birthday}
                            className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                          >
                            <FaCalendar />
                            {birthday ? (
                              format(birthday, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={birthday}
                            onSelect={setBirthday}
                          />
                        </PopoverContent>
                      </Popover>
                      {updatingError?.dob && (
                        <p className="text-red-400 text-sm mb-2">
                          {updatingError?.dob.msg}
                        </p>
                      )}
                    </div>
                    <div className="">
                      <Label
                        htmlFor="password-1"
                        className="grid gap-3 relative"
                      >
                        enter password :{" "}
                        <Input
                          required
                          id="password-1"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          defaultValue={passwordForUpdate}
                          onChange={(e) => setPasswordForUpdate(e.target.value)}
                        />
                        <div className="absolute right-3 h-full cursor-pointer flex items-center top-3 ">
                          {showPassword ? (
                            <FaRegEyeSlash
                              onClick={() => setShowPassword(false)}
                            />
                          ) : (
                            <FaRegEye
                              onClick={() => setShowPassword(true)}
                              className=""
                            />
                          )}
                        </div>
                      </Label>

                      {updatingError?.password && (
                        <p className="text-red-400 text-sm mb-2">
                          {updatingError?.password.msg}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </>
              )}

              {isUpdating ? (
                <Button>
                  <ClipLoader size={15} loading={true} color="gray" />
                </Button>
              ) : isUpdated ? (
                <DialogClose>
                  <Button
                    className="w-full cursor-pointer"
                    onClick={() => {
                      setIsUpdated(false);
                    }}
                  >
                    go back
                  </Button>
                </DialogClose>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="cursor-pointer w-full"
                      disabled={!passwordForUpdate || !usersVisibleName}
                    >
                      Save changes
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Update</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to update your <b>birthday</b> to{" "}
                        {format(birthday, "dd MMMM yyyy (EEEE)")} ?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDobUpdate}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* for changing location */}
      <div className="flex flex-col">
        <label className="bg-gray-300 w-full px-2 flex gap-2 items-center ">
          <MdLocationPin /> location:
        </label>
        <div className="flex justify-between p-4 ">
          <p>{user.location || "location is not added yet"}</p>
          <Dialog>
            <DialogTrigger asChild>
              <MdEdit />
            </DialogTrigger>{" "}
            <DialogContent className="sm:max-w-[425px]">
              {isUpdated ? (
                <DialogTitle className="text-center p-2">
                  location updated to{" "}
                  <span className="bg-gray-200 p-1 px-2 text-2xl rounded-xl">
                    {userLocation}
                  </span>
                  <DialogDescription>
                    you cant change location before 48 hours{" "}
                  </DialogDescription>
                </DialogTitle>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit location </DialogTitle>
                    <DialogDescription>
                      Make changes to your location here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="location">change location :</Label>
                      <Input
                        required
                        id="location"
                        name="location"
                        defaultValue={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                      />
                      {updatingError?.location && (
                        <p className="text-red-400 text-sm mb-2">
                          {updatingError?.location.msg}
                        </p>
                      )}
                    </div>
                    <div className="">
                      <Label
                        htmlFor="password-3"
                        className="grid gap-3 relative"
                      >
                        enter password :{" "}
                        <Input
                          required
                          id="password-3"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          defaultValue={passwordForUpdate}
                          onChange={(e) => setPasswordForUpdate(e.target.value)}
                        />
                        <div className="absolute right-3 h-full cursor-pointer flex items-center top-3 ">
                          {showPassword ? (
                            <FaRegEyeSlash
                              onClick={() => setShowPassword(false)}
                            />
                          ) : (
                            <FaRegEye
                              onClick={() => setShowPassword(true)}
                              className=""
                            />
                          )}
                        </div>
                      </Label>

                      {updatingError?.password && (
                        <p className="text-red-400 text-sm mb-2">
                          {updatingError?.password.msg}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </>
              )}

              {isUpdating ? (
                <Button>
                  <ClipLoader size={15} loading={true} color="gray" />
                </Button>
              ) : isUpdated ? (
                <DialogClose>
                  <Button
                    className="w-full cursor-pointer"
                    onClick={() => {
                      setIsUpdated(false);
                    }}
                  >
                    go back
                  </Button>
                </DialogClose>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="cursor-pointer w-full"
                      disabled={!passwordForUpdate || !userLocation}
                    >
                      Save changes
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Update</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to update your <b>location</b> to{" "}
                        {userLocation}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLocationUpdate}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* for changing website */}
      <div className="flex flex-col">
        <label className="bg-gray-300 w-full px-2 flex gap-2 items-center ">
          <MdWeb /> website:
        </label>
        <div className="flex justify-between p-4 ">
          <p
            className={`${
              user.location &&
              " bg-gray-300 rounded-2xl px-2 hover:underline cursor-pointer"
            }`}
            onClick={() => user.website}
          >
            {user.website || "website is not added yet"}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <MdEdit />
            </DialogTrigger>{" "}
            <DialogContent className="sm:max-w-[425px]">
              {isUpdated ? (
                <DialogTitle className="text-center p-2">
                  website updated to{" "}
                  <span className="bg-gray-200 p-1 px-2 text-2xl rounded-xl">
                    {web}
                  </span>
                  <DialogDescription>
                    you cant change website before 48 hours{" "}
                  </DialogDescription>
                </DialogTitle>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit website </DialogTitle>
                    <DialogDescription>
                      Make changes to your website here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="location">change website :</Label>
                      <Input
                        required
                        id="location"
                        name="location"
                        defaultValue={web}
                        onChange={(e) => setWeb(e.target.value)}
                      />
                      {updatingError?.website && (
                        <p className="text-red-400 text-sm mb-2">
                          {updatingError?.website.msg}
                        </p>
                      )}
                    </div>
                    <div className="">
                      <Label
                        htmlFor="password-4"
                        className="grid gap-3 relative"
                      >
                        enter password :{" "}
                        <Input
                          required
                          id="password-4"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          defaultValue={passwordForUpdate}
                          onChange={(e) => setPasswordForUpdate(e.target.value)}
                        />
                        <div className="absolute right-3 h-full cursor-pointer flex items-center top-3 ">
                          {showPassword ? (
                            <FaRegEyeSlash
                              onClick={() => setShowPassword(false)}
                            />
                          ) : (
                            <FaRegEye
                              onClick={() => setShowPassword(true)}
                              className=""
                            />
                          )}
                        </div>
                      </Label>

                      {updatingError?.password && (
                        <p className="text-red-400 text-sm mb-2">
                          {updatingError?.password.msg}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </>
              )}

              {isUpdating ? (
                <Button>
                  <ClipLoader size={15} loading={true} color="gray" />
                </Button>
              ) : isUpdated ? (
                <DialogClose>
                  <Button
                    className="w-full cursor-pointer"
                    onClick={() => {
                      setIsUpdated(false);
                    }}
                  >
                    go back
                  </Button>
                </DialogClose>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="cursor-pointer w-full"
                      disabled={!passwordForUpdate || !userLocation}
                    >
                      Save changes
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Update</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to update your <b>website</b> to{" "}
                        {web}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleWebsiteUpdate}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
