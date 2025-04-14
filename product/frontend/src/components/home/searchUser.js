"use client";
import { useEffect, useState } from "react";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { searchAction } from "@/lib/action";
import Link from "next/link";

export const SearchUser = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  useEffect(() => {
    if (query.length > 0) {
      setLoading(true);
      searchAction(query)
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div>
      <div onClick={() => setOpen(true)}>
        <FontAwesomeIcon icon={faSearch} size="md" className="lg:mr-2" />
        <span className="hidden lg:inline hover:text-white">Search</span>
      </div>
      {open && (
        <div className="fixed w-screen h-screen bg-black top-0 bg-opacity-50 left-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="p-5 border-t-[2px] border-b-[2px] border-[#FF4E02] bg-white rounded-lg shadow-md flex flex-col gap-4 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%] xl:w-[30%] relative">
            <div className="flex justify-between text-base text-[#FF4E01] items-center h-6">
              <span className="flex flex-1 px-2 lg:px-5">Search</span>
              <span
                className="w-8 h-8 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer"
                onClick={handleClose}
              >
                <FontAwesomeIcon icon={faXmark} size="md" />
              </span>
            </div>
            {/* search box */}
            <div className="w-full justify-center items-center px-2 lg:px-5">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Wanna find someone, Kuma?"
                className="w-full border-2 text-black border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="flex justify-center items-center text-xs flex-shrink-0 text-gray-500 text-center h-6 bg-gray-300 lg:mx-8 rounded-sm">
              ** you can find someone by name or user ID **
            </div>
            <Separator
              orientation="horizontal"
              className="bg-gray-300 h-[0.05rem] w-[95%] mb-2 mx-auto"
            />
            {/* Showing search results */}
            <div className="p-2 justify-center items-center flex flex-col gap-2">
              {loading ? (
                <p>Searching...</p>
              ) : results.length > 0 ? (
                results.map((user) => (
                  <div
                    key={user.id}
                    className="flex w-full gap-2 items-center hover:bg-slate-200 p-2 px-12 bg-gray-50 rounded-xl"
                  >
                    <Link
                      href={`/profile/${user.id}`}
                      key={user.id}
                      className="flex"
                    >
                      <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
                        <img
                          src={user.avatar || "/user-default.png"}
                          alt="profile"
                          className="w-12 h-12 rounded-full ring-1 ring-[#FF4E01]"
                        />
                      </div>
                      <div className="flex flex-row gap-2 cursor-pointer items-center justify-center">
                        <span className="text-black text-sm line-clamp-1">
                          {user?.name && user?.surname
                            ? user.name + " " + user.surname
                            : "Kuma User"}
                        </span>
                        <span className="text-xs text-gray-500 line-clamp-1">
                          @{user.username}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <p>No results found, Kuma</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchUser;
