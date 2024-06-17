import React, { useState, useEffect } from 'react';
import Image from "next/image";
import logo from '../assets/oneridetho_logo_600ppi.png';
import ar from '../assets/driverheadshotphotos/ar.jpeg';
import bm from '../assets/driverheadshotphotos/bm.jpg';
import cr from '../assets/driverheadshotphotos/cr.png';
import df from '../assets/driverheadshotphotos/df.jpg';
import em from '../assets/driverheadshotphotos/em.jpg';
import ha from '../assets/driverheadshotphotos/ha.jpg';
import ir from '../assets/driverheadshotphotos/ir.jpg';
import jb from '../assets/driverheadshotphotos/jb.jpg';
import jc from '../assets/driverheadshotphotos/jc.jpeg';
import jr from '../assets/driverheadshotphotos/jr.jpg';
import ka from '../assets/driverheadshotphotos/ka.jpeg';
import kc from '../assets/driverheadshotphotos/kc.jpg';
import ks from '../assets/driverheadshotphotos/ks.jpeg';
import mc from '../assets/driverheadshotphotos/mc.jpeg';
import mm from '../assets/driverheadshotphotos/mm.jpg';
import pm from '../assets/driverheadshotphotos/pm.jpg';
import rb from '../assets/driverheadshotphotos/rb.jpg';
import sf from '../assets/driverheadshotphotos/sf.jpg';
import ss from '../assets/driverheadshotphotos/ss.jpg';
import th from '../assets/driverheadshotphotos/th.jpg';
import { useSession } from 'next-auth/react';


const DriversPhotoBlockPanel: React.FC = () => {

    // Array of image paths
    const imagePaths = [ ar, bm, cr, df, em, ha, ir, jb, jc, jr, ka, kc, ks, mc, mm, pm, rb, sf, ss, th ];

    const [colorMap, setColorMap] = useState<string[]>([]);

    
    const { data: session } = useSession();
    const isLoggedIn = session != null;

    useEffect(() => {
        const newColorMap = imagePaths.map((_, index) =>
            index % 2 === 0 ? 'rgb(30, 142, 2)' : 'white'
        );
        setColorMap(newColorMap);
    }, []);

    const blockFieldClickHandler = (clickEvent: React.MouseEvent<HTMLButtonElement>) => {
        if (clickEvent?.target && (clickEvent.target as HTMLButtonElement).dataset) {
            // You may choose to add logic here that displays the driver's name or something in this handler
            // console.log('clicked block info', clickEvent.target.dataset);
        }
    };

    return (
      <div className="min-w-[320px] h-screen border-none">
        <h1>The Team - Meet Our Drivers</h1>
        <br />
        <div id="colour-options-grid">
          <button
            type="button"
            aria-label="color-button"
            id="colour-options-grid"
            className="sm:max-w-none"
            style={{ maxWidth: "100%" }}
            onClick={blockFieldClickHandler}
          >
            <div className="relative items-center justify-center">
              <Image
                id="watermark-ort-logo"
                src={logo}
                alt="Logo Watermark"
                className="opacity-70 pt-12"
              />
            </div>

            {[...Array(10)].map((_, groupIndex) => (
              <div
                className="ColouredPhotoGroup float-left block"
                key={groupIndex}
              >
                {/* Generate ColouredPhotoBlock components */}
                {[...Array(8)].map((_, blockIndex) => {
                  const currentIndex = groupIndex * 8 + blockIndex;
                  // Ensure currentIndex does not exceed the length of imagePaths
                  const currentImagePath =
                    imagePaths[currentIndex % imagePaths.length];
                  const currentColor =
                    colorMap[currentIndex % imagePaths.length];

                  return (
                    <div className="ColouredPhotoBlock" key={blockIndex}>
                      <div
                        className="ColouredPhotoField"
                        style={{ backgroundColor: currentColor }}
                        data-hex={
                          currentColor === "rgb(30, 142, 2)"
                            ? "#1e8e02"
                            : "#ffffff"
                        }
                        data-rgb={
                          currentColor === "rgb(30, 142, 2)"
                            ? "30, 142, 2"
                            : "255, 255, 255"
                        }
                        data-hsl={
                          currentColor === "rgb(30, 142, 2)"
                            ? "108, 97%, 28%"
                            : "0, 0%, 100%"
                        }
                      >
                        <Image
                          id="driver-image"
                          alt="A dedicated driver"
                          src={currentImagePath}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </button>
        </div>
      </div>
    );
};

export default DriversPhotoBlockPanel;
