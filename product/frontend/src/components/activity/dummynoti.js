export const Dummynoti = () => {
  return (
    <div className="flex items-center hover:bg-slate-200 gap-2 p-4 rounded-xl">
      <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
        <img
          src="/stories1.jpg"
          alt="profile"
          className="w-10 h-10 rounded-full ring-1 ring-[#FF4E01]"
        />
      </div>
      <span className="text-md flex-grow line-clamp-2">
        <span className=" font-bold">
          Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit Sed Do Eiusmod
          Tempor Incididunt Ut Labore Et Dolore Magna Aliqua Ut Enim Ad Minim
          Veniam Quis Nostrud Exercitation Ullamco Laboris Nisi Ut Aliquip Ex Ea
          Commodo Consequat Duis Aute Irure Dolor In Reprehenderit In Voluptate
          Velit Esse Cillum Dolore Eu F fugiat Nulla Pariatur Excepteur Sint
          Occaecat Cupidatat Non Proident Sunt In Culpa Qui Officia Deserunt
          Mollit Anim Id Est Laborum{" "}
        </span>
      </span>
    </div>
  );
};
export default Dummynoti;
