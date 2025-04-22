'use client'

import { Figtree } from 'next/font/google'
import '@/assets/scss/app.scss'
import '@/assets/scss/landing.scss'
import { DEFAULT_PAGE_TITLE } from '@/context/constants'
import NextTopLoader from 'nextjs-toploader'
import LogoDark from '@/assets/images/logo-dark.png'
import LogoLight from '@/assets/images/logo-light.png'
import Link from 'next/link'
import Image from 'next/image'
import { SessionProvider } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navTriggerRef = useRef<HTMLDivElement>(null);

  // Añadir efecto de scroll para cambiar el fondo de la navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Limpieza
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <SessionProvider>
      <div className={figtree.className}>
        <NextTopLoader color="#0acf97" showSpinner={false} />
        
        {/* Navegación */}
        <nav className={`nav ${isScrolled ? 'affix' : ''}`}>
          <div className="container">
            <div className="logo">
              <Link href="/">
                <Image 
                  src="/images/real-estate/logo.svg" 
                  alt="Quincenalia" 
                  width={182}
                  height={52}
                  priority 
                  className="logo-image"
                />
              </Link>
            </div>
            <div id="mainListDiv" className={`main_list ${isMenuOpen ? 'show_list' : ''}`}>
              <ul className="navlinks">
                <li><Link href="/">Inicio</Link></li>
                <li><Link href="/propiedades/listado">Propiedades</Link></li>
                <li><Link href="/about">Nosotros</Link></li>
                <li><Link href="/contact">Contacto</Link></li>
                <li className="nav-button"><Link href="/auth/sign-in">Iniciar Sesión</Link></li>
                <li className="nav-button highlight"><Link href="/auth/sign-up">Registrarse</Link></li>
              </ul>
            </div>
            <div 
              ref={navTriggerRef} 
              className={`navTrigger ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
            >
              <i></i>
              <i></i>
              <i></i>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <div className="main-content">
          {children}
        </div>

        {/* Estilos CSS */}
        <style jsx global>{`
          .nav {
            width: 100%;
            height: 80px;
            position: fixed;
            line-height: 80px;
            text-align: center;
            padding-top: 15px;
            padding-bottom: 15px;
            -webkit-transition: all 0.4s ease;
            transition: all 0.4s ease;
            z-index: 10000;
          }

          .nav.affix {
            padding: 0;
            background-color: rgba(17, 17, 17, 0.9);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }

          .nav div.logo {
            float: left;
            width: auto;
            height: auto;
            padding-left: 3rem;
            display: flex;
            align-items: center;
          }

          .nav div.main_list {
            height: 65px;
            float: right;
          }

          .nav div.main_list ul {
            width: 100%;
            height: 65px;
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
            align-items: center;
          }

          .nav div.main_list ul li {
            width: auto;
            height: 65px;
            padding: 0;
            padding-right: 3rem;
            display: flex;
            align-items: center;
          }

          .nav div.main_list ul li a {
            text-decoration: none;
            color: #fff;
            font-size: 16px;
            font-weight: 500;
            transition: color 0.3s ease;
          }

          .nav div.main_list ul li a:hover {
            color: #00E676;
          }

          .nav div.main_list ul li.nav-button a {
            padding: 8px 16px;
            line-height: 1.5;
            border-radius: 4px;
            border: 1px solid #fff;
            display: inline-block;
            transition: all 0.3s ease;
          }

          .nav div.main_list ul li.nav-button a:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .nav div.main_list ul li.highlight a {
            background-color: #0acf97;
            border-color: #0acf97;
            color: white;
            font-weight: 500;
            padding: 8px 20px;
            text-align: center;
          }

          .nav div.main_list ul li.highlight a:hover {
            background-color: #09b384;
            transform: translateY(-2px);
          }

          .navTrigger {
            display: none;
            cursor: pointer;
            width: 30px;
            height: 25px;
            margin: auto;
            position: absolute;
            right: 30px;
            top: 0;
            bottom: 0;
          }

          .navTrigger i {
            background-color: #fff;
            border-radius: 2px;
            content: '';
            display: block;
            width: 100%;
            height: 4px;
          }

          .navTrigger i:nth-child(1) {
            -webkit-animation: outT 0.8s backwards;
            animation: outT 0.8s backwards;
            -webkit-animation-direction: reverse;
            animation-direction: reverse;
          }

          .navTrigger i:nth-child(2) {
            margin: 5px 0;
            -webkit-animation: outM 0.8s backwards;
            animation: outM 0.8s backwards;
            -webkit-animation-direction: reverse;
            animation-direction: reverse;
          }

          .navTrigger i:nth-child(3) {
            -webkit-animation: outBtm 0.8s backwards;
            animation: outBtm 0.8s backwards;
            -webkit-animation-direction: reverse;
            animation-direction: reverse;
          }

          .navTrigger.active i:nth-child(1) {
            -webkit-animation: inT 0.8s forwards;
            animation: inT 0.8s forwards;
          }

          .navTrigger.active i:nth-child(2) {
            -webkit-animation: inM 0.8s forwards;
            animation: inM 0.8s forwards;
          }

          .navTrigger.active i:nth-child(3) {
            -webkit-animation: inBtm 0.8s forwards;
            animation: inBtm 0.8s forwards;
          }

          @-webkit-keyframes inM {
            50% {
              -webkit-transform: rotate(0deg);
            }
            100% {
              -webkit-transform: rotate(45deg);
            }
          }

          @keyframes inM {
            50% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(45deg);
            }
          }

          @-webkit-keyframes outM {
            50% {
              -webkit-transform: rotate(0deg);
            }
            100% {
              -webkit-transform: rotate(45deg);
            }
          }

          @keyframes outM {
            50% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(45deg);
            }
          }

          @-webkit-keyframes inT {
            0% {
              -webkit-transform: translateY(0px) rotate(0deg);
            }
            50% {
              -webkit-transform: translateY(9px) rotate(0deg);
            }
            100% {
              -webkit-transform: translateY(9px) rotate(135deg);
            }
          }

          @keyframes inT {
            0% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(9px) rotate(0deg);
            }
            100% {
              transform: translateY(9px) rotate(135deg);
            }
          }

          @-webkit-keyframes outT {
            0% {
              -webkit-transform: translateY(0px) rotate(0deg);
            }
            50% {
              -webkit-transform: translateY(9px) rotate(0deg);
            }
            100% {
              -webkit-transform: translateY(9px) rotate(135deg);
            }
          }

          @keyframes outT {
            0% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(9px) rotate(0deg);
            }
            100% {
              transform: translateY(9px) rotate(135deg);
            }
          }

          @-webkit-keyframes inBtm {
            0% {
              -webkit-transform: translateY(0px) rotate(0deg);
            }
            50% {
              -webkit-transform: translateY(-9px) rotate(0deg);
            }
            100% {
              -webkit-transform: translateY(-9px) rotate(135deg);
            }
          }

          @keyframes inBtm {
            0% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-9px) rotate(0deg);
            }
            100% {
              transform: translateY(-9px) rotate(135deg);
            }
          }

          @-webkit-keyframes outBtm {
            0% {
              -webkit-transform: translateY(0px) rotate(0deg);
            }
            50% {
              -webkit-transform: translateY(-9px) rotate(0deg);
            }
            100% {
              -webkit-transform: translateY(-9px) rotate(135deg);
            }
          }

          @keyframes outBtm {
            0% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-9px) rotate(0deg);
            }
            100% {
              transform: translateY(-9px) rotate(135deg);
            }
          }

          @media screen and (max-width:768px) {
            .navTrigger {
              display: block;
            }
            .nav div.logo {
              margin-left: 15px;
            }
            .nav div.main_list {
              width: 100%;
              height: 0;
              overflow: hidden;
            }
            .nav div.show_list {
              height: auto;
              display: block;
              position: absolute;
              top: 80px;
              left: 0;
              width: 100%;
              background-color: rgba(0, 0, 0, 0.8);
              padding-bottom: 20px;
              box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
              animation: fadeIn 0.3s ease-in-out;
            }
            
            .nav {
              background-color: transparent !important;
              box-shadow: none !important;
            }
            
            .nav.affix {
              background-color: rgba(17, 17, 17, 0.9) !important;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .nav div.main_list ul {
              flex-direction: column;
              width: 100%;
              height: auto;
              right: 0;
              left: 0;
              bottom: 0;
              padding-top: 20px;
            }
            .nav div.main_list ul li {
              width: 100%;
              text-align: center;
              padding-right: 0;
              height: auto;
              margin: 8px 0;
            }
            .nav div.main_list ul li a {
              text-align: center;
              width: 100%;
              font-size: 16px;
              padding: 10px;
              line-height: normal !important;
            }
            .nav div.main_list ul li.nav-button {
              margin-top: 15px;
            }
            .nav div.main_list ul li.nav-button a {
              display: inline-block;
              margin: 5px 0;
              width: 200px;
              max-width: 80%;
            }
          }

          .logo-image {
            filter: brightness(0) invert(1);
          }
        `}</style>
      </div>
    </SessionProvider>
  )
} 