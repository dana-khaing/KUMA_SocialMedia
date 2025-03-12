// import { auth } from "@clerk/nextjs/server";

const SearchAction = (query) => {
  //   const { userId } = await auth();
  //   if (!userId) {
  //     return null;
  //   }
  const { search } = query;
  console.log(search);

  return <div>test</div>;
};

export default SearchAction;
