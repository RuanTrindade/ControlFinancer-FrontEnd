import * as BiIcons from "react-icons/bi";
import type { IconType } from "react-icons";

import { mapaIconesCategorias } from "./iconesCategorias";

const iconesAntigos: Record<string, keyof typeof BiIcons> = {
    "bi-wallet": "BiWallet",
    "bi-basket": "BiBasket",
    "bi-car-front": "BiCar",
    "bi-graph-up": "BiLineChart",
    "bi-cash": "BiMoney",
    "bi-heart-pulse": "BiHeart",
};

export function renderizarIcone(nomeIcone: string | null | undefined) {
    if (!nomeIcone) {
        return <BiIcons.BiCategory />;
    }

    const nomeConvertido = iconesAntigos[nomeIcone] ?? nomeIcone;

    if (mapaIconesCategorias[nomeConvertido]) {
        return mapaIconesCategorias[nomeConvertido];
    }

    const Icone = BiIcons[nomeConvertido as keyof typeof BiIcons] as IconType | undefined;

    if (!Icone) {
        return <BiIcons.BiCategory />;
    }

    return <Icone />;
}
