import illusiaImage from "@/assets/illusiaImage.jpg";
import { Button } from "./ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const LandingPage = () => {
  // Translation
  const { lang } = useLanguage();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-[-8px] bg-cover bg-center -z-10 blur-[5px]"
        style={{ 
          backgroundImage: `url(${illusiaImage})`,
        }}
      />

      {/* Content on top of image */}
      <div className="flex flex-col justify-center items-center min-h-screen text-white text-center px-4 gap-2">
        <h2 className="text-5xl font-bold mb-4 text-primary">
          {t.landingPage.heading[lang]}
        </h2>
        <p className="mb-6 text-xl text-primary">{t.landingPage.subheading[lang]}</p>
        <Button
          onClick={() => (window.location.href = "/storage")}
          className="bg-secondary text-white border:secondary font-semibold px-6 py-5 rounded-lg shadow hover:bg-white hover:text-secondary hover:border-secondary transition"
        >
          {t.landingPage.button[lang]}
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
