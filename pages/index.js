import Image from 'next/image';

export default function Home() {
  return (
    <div className="text-white bg-slate-900 h-screen relative">
      <main>
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
      </main>

      <footer className="absolute bottom-0 w-full flex justify-center py-5">
        Created by Elijah
      </footer>
    </div>
  );
}
