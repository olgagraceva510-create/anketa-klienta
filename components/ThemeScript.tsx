export function ThemeScript() {
  const code = `(function(){try{var k="anketa-theme";var t=localStorage.getItem(k);if(t==="dark"||t==="light"){document.documentElement.classList.toggle("dark",t==="dark");}}catch(e){}})();`;
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
