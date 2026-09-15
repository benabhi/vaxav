/**
 * Qué se le puede montar a una ranura: **lo que el piloto tiene**.
 *
 * Sin esto, la pantalla de equipamiento ofrece el catálogo entero como si los
 * módulos no fueran de nadie ni estuvieran en ningún lado. Un módulo tiene que
 * estar en algún lugar para poder montarlo, y ese lugar es la bodega de la nave.
 *
 * **La estación ya no surte módulos.** Antes, estar atracado en un lugar con
 * Equipamiento hacía aparecer el catálogo entero y gratis, lo que convertía la
 * ranura en una lista de compras sin precio. Comprar es del **mercado**, que es
 * donde viven la búsqueda y el árbol de categorías; equipar es mover lo que ya es
 * tuyo de la bodega a una ranura y al revés. Son dos verbos distintos y viven en
 * dos pantallas distintas.
 *
 * Lo que la estación sigue decidiendo es **si podés tocar la nave**: hace falta
 * el módulo de Equipamiento para desarmarla, y eso lo resuelve `status`.
 *
 * Reglas puras: acá no hay base de datos ni piloto. Corresponde a
 * docs/systems/SHIPS.md.
 */

import type { CoreSystem, SlotKind } from './hulls';
import type { ShipModule } from './modules';
import { unmetFrom } from './skills';

/**
 * Qué de la bodega entra en esta ranura.
 *
 * Un módulo entra si es del tipo correcto y **de clase igual o menor**: en una
 * ranura de clase 3 entra uno de clase 2, nunca uno de clase 4. Los internos
 * esenciales filtran además por cuál de los siete sistemas son.
 *
 * Se devuelve **un renglón por montón y no por unidad**: llevar tres láseres
 * iguales no tiene que llenar la lista con el mismo nombre tres veces. Cuál de
 * los tres se monta es indistinto, porque son fungibles.
 *
 * Con la bodega vacía la lista sale vacía. Eso **no es un error**: es lo que
 * significa no tener repuestos.
 *
 * **Y sólo lo que sabe usar.** Un módulo cuyo requisito no cumple no se ofrece:
 * montarlo dejaría la nave en tierra, y una lista que permite elegir algo que
 * rompe la nave no es una lista, es una trampa. El módulo no desaparece —sigue en
 * la bodega, se ve en Propiedades y se puede vender— pero la ranura no lo toma.
 */
export function availableForSlot(
	kind: SlotKind,
	size: number,
	core: CoreSystem | null,
	cargo: Iterable<ShipModule> = [],
	skills: Readonly<Record<string, number>> = {}
): readonly ShipModule[] {
	const vistos = new Set<string>();
	const disponibles: ShipModule[] = [];

	for (const module of cargo) {
		if (module.kind !== kind || module.size > size || module.core !== core) continue;
		if (unmetFrom(module.requirements, skills).length > 0) continue;
		if (vistos.has(module.code)) continue;
		vistos.add(module.code);
		disponibles.push(module);
	}

	// De mayor a menor clase y después por nombre: el orden del catálogo, para
	// que la lista no cambie de posición entre dos cargas.
	return disponibles.sort((a, b) => b.size - a.size || a.name.localeCompare(b.name));
}
