import { Separator } from "@radix-ui/react-separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCakeCandles } from "@fortawesome/free-solid-svg-icons";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { format, isToday, isWithinInterval, addDays } from "date-fns";

// Utility function to get users with birthdays today or within 7 days
async function getBirthday() {
  try {
    const users = await prisma.user.findMany({
      where: {
        dob: {
          not: null, // Ensure dob exists
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        dob: true,
      },
    });

    // Filter users with birthdays today or within the next 7 days
    const today = new Date();
    const birthdayUsers = users
      .filter((user) => {
        const dob = new Date(user.dob);
        const birthdayThisYear = new Date(
          today.getFullYear(),
          dob.getMonth(),
          dob.getDate()
        );
        const birthdayNextYear = new Date(
          today.getFullYear() + 1,
          dob.getMonth(),
          dob.getDate()
        );

        // Include birthdays today or within the next 7 days
        return (
          isToday(birthdayThisYear) ||
          isWithinInterval(birthdayThisYear, {
            start: today,
            end: addDays(today, 7),
          }) ||
          isWithinInterval(birthdayNextYear, {
            start: today,
            end: addDays(today, 7),
          })
        );
      })
      // Sort: Today's birthdays first, then upcoming by date
      .sort((a, b) => {
        const aDob = new Date(a.dob);
        const bDob = new Date(b.dob);
        const aBirthday = new Date(
          today.getFullYear(),
          aDob.getMonth(),
          aDob.getDate()
        );
        const bBirthday = new Date(
          today.getFullYear(),
          bDob.getMonth(),
          bDob.getDate()
        );

        // Adjust for next year if birthday has passed
        if (aBirthday < today) aBirthday.setFullYear(today.getFullYear() + 1);
        if (bBirthday < today) bBirthday.setFullYear(today.getFullYear() + 1);

        // Prioritize today's birthdays
        const aIsToday = isToday(aBirthday);
        const bIsToday = isToday(bBirthday);
        if (aIsToday && !bIsToday) return -1;
        if (!aIsToday && bIsToday) return 1;

        // Sort by date for non-today birthdays
        return aBirthday - bBirthday;
      });

    return birthdayUsers;
  } catch (error) {
    console.error("Error fetching birthday data:", error);
    return [];
  }
}

const Birthday = async () => {
  const { userId } = auth();
  const birthdayData = await getBirthday();

  return (
    <div className="w-full bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">Birthday Celebrations</span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mx-auto"
      />
      <div className="h-fit overflow-y-scroll scrollbar-hide flex flex-col gap-4 mt-2 px-2 py-2">
        {birthdayData.length === 0 ? (
          <div className="flex gap-2 px-2 pb-2 items-center">
            <FontAwesomeIcon
              icon={faCakeCandles}
              size="2xl"
              className="text-[#FF4E01]"
            />
            <span className="text-xs flex-grow line-clamp-2">
              No birthdays to celebrate yet. 🥺
            </span>
          </div>
        ) : (
          birthdayData.map((user) => (
            <div key={user.id} className="flex gap-2 px-2 pb-2 items-center">
              <FontAwesomeIcon
                icon={faCakeCandles}
                size="2xl"
                className="text-[#FF4E01]"
              />
              <span className="text-xs flex-grow line-clamp-2">
                <span className="font-bold">
                  {user.name && user.surname
                    ? `${user.name} ${user.surname}`
                    : user.username}
                </span>{" "}
                {isToday(
                  new Date(
                    new Date().getFullYear(),
                    new Date(user.dob).getMonth(),
                    new Date(user.dob).getDate()
                  )
                )
                  ? "has their birthday today"
                  : `has their birthday on ${format(
                      new Date(user.dob),
                      "MMMM d"
                    )}`}
                , 🎉 Let's celebrate Kuma! 🎉
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Birthday;
