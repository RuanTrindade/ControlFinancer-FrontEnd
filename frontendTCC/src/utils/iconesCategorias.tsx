import {
    BiBasket,
    BiBook,
    BiBriefcase,
    BiBuildingHouse,
    BiBus,
    BiCar,
    BiCart,
    BiCategory,
    BiCoffee,
    BiCreditCard,
    BiDollarCircle,
    BiDonateHeart,
    BiDumbbell,
    BiGame,
    BiGift,
    BiGlobe,
    BiHealth,
    BiHome,
    BiMoviePlay,
    BiMusic,
    BiPackage,
    BiPhone,
    BiPlanet,
    BiRestaurant,
    BiShoppingBag,
    BiStore,
    BiTransfer,
    BiWallet,
} from "react-icons/bi";

import {
    RiBookOpenLine,
    RiCarLine,
    RiComputerLine,
    RiHeartLine,
    RiHome4Line,
    RiMoneyDollarCircleLine,
    RiPlaneLine,
    RiTrophyLine,
} from "react-icons/ri";

import type { ReactNode } from "react";

export type IconeCategoria = {
    nome: string;
    componente: ReactNode;
};

export const iconesCategorias: IconeCategoria[] = [
    { nome: "BiCar", componente: <BiCar /> },
    { nome: "BiShoppingBag", componente: <BiShoppingBag /> },
    { nome: "BiCreditCard", componente: <BiCreditCard /> },
    { nome: "BiPlane", componente: <BiPlanet /> },
    { nome: "BiBuildingHouse", componente: <BiBuildingHouse /> },
    { nome: "BiCart", componente: <BiCart /> },
    { nome: "BiHealth", componente: <BiHealth /> },
    { nome: "BiGlobe", componente: <BiGlobe /> },
    { nome: "BiDumbbell", componente: <BiDumbbell /> },
    { nome: "BiDonateHeart", componente: <BiDonateHeart /> },
    { nome: "BiHome", componente: <BiHome /> },
    { nome: "BiPhone", componente: <BiPhone /> },
    { nome: "BiWallet", componente: <BiWallet /> },
    { nome: "BiDollarCircle", componente: <BiDollarCircle /> },
    { nome: "BiTransfer", componente: <BiTransfer /> },
    { nome: "BiRestaurant", componente: <BiRestaurant /> },
    { nome: "BiCoffee", componente: <BiCoffee /> },
    { nome: "BiBasket", componente: <BiBasket /> },
    { nome: "BiStore", componente: <BiStore /> },
    { nome: "BiBook", componente: <BiBook /> },
    { nome: "BiBriefcase", componente: <BiBriefcase /> },
    { nome: "BiBus", componente: <BiBus /> },
    { nome: "BiGift", componente: <BiGift /> },
    { nome: "BiGame", componente: <BiGame /> },
    { nome: "BiMoviePlay", componente: <BiMoviePlay /> },
    { nome: "BiMusic", componente: <BiMusic /> },
    { nome: "BiPackage", componente: <BiPackage /> },
    { nome: "BiCategory", componente: <BiCategory /> },
];

export const iconesObjetivos: IconeCategoria[] = [
    {
        nome: "RiCarLine",
        componente: <RiCarLine />,
    },

    {
        nome: "RiHome4Line",
        componente: <RiHome4Line />,
    },

    {
        nome: "RiPlaneLine",
        componente: <RiPlaneLine />,
    },

    {
        nome: "RiBookOpenLine",
        componente: <RiBookOpenLine />,
    },

    {
        nome: "RiComputerLine",
        componente: <RiComputerLine />,
    },

    {
        nome: "RiMoneyDollarCircleLine",
        componente: <RiMoneyDollarCircleLine />,
    },

    {
        nome: "RiTrophyLine",
        componente: <RiTrophyLine />,
    },

    {
        nome: "RiHeartLine",
        componente: <RiHeartLine />,
    },
];

export const mapaIconesCategorias: Record<string, ReactNode> = {
    ...Object.fromEntries(iconesCategorias.map((item) => [item.nome, item.componente])),

    ...Object.fromEntries(iconesObjetivos.map((item) => [item.nome, item.componente])),

    alimentacao: <BiRestaurant />,

    transporte: <BiCar />,

    contas: <BiWallet />,

    investimentos: <BiDollarCircle />,

    objetivos: <BiDonateHeart />,

    academia: <BiDumbbell />,

    lazer: <BiGame />,

    educacao: <BiBook />,

    saude: <BiHealth />,
};
