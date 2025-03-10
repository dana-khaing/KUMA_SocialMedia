"use client";
import { useState } from "react";

const UserDetailUpdate = ({ user, owner }) => {
  const [open, setOpen] = useState(false);

  return <div onClick={() => setOpen(true)}>Edit</div>;
};
export default UserDetailUpdate;
