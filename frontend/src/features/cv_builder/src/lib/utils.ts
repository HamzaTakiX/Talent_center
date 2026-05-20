export const textAreaFormat = (x: string) =>
  x?.split("\n")?.map((l) => l?.slice(2));

export const generatePDF = () => {
  if ("ontouchstart" in document.documentElement) {
    alert("WIP!");
    return;
  }

  const resume = document.getElementById("resume");
  if (!resume) {
    window.print();
    return;
  }

  document.body.classList.add("quickcv-print-mode");

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.body.classList.remove("quickcv-print-mode");
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);
  window.setTimeout(cleanup, 3000);
  window.print();
};

export const formatUrl = (url: any) => {
   if(url?.startsWith("https")) {
    return url?.replace("https://", "");
  }
  return url
}
