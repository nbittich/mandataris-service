import {
  shouldPersonBeCopied,
  copyPersonToGraph,
  getDestinationGraphPerson,
  checkFractieQuery,
  persoon,
} from '../data-access/persoon';

import { areIdsValid, isValidId, RDF_TYPE } from '../util/valid-id';
import { STATUS_CODE } from '../util/constants';
import { HttpError } from '../util/http-error';

export const persoonUsecase = {
  getFractie,
};

async function getFractie(
  id: string,
  bestuursperiodeId: string,
): Promise<string | undefined> {
  const isPersoon = await areIdsValid(RDF_TYPE.PERSON, [id]);
  if (!isPersoon) {
    throw new HttpError(
      `Person with id ${id} was not found.`,
      STATUS_CODE.BAD_REQUEST,
    );
  }

  const isBestuursperiode = await areIdsValid(RDF_TYPE.BESTUURSPERIODE, [
    bestuursperiodeId,
  ]);
  if (!isBestuursperiode) {
    throw new HttpError(
      `Bestuursperiode with id ${bestuursperiodeId} not found.`,
      STATUS_CODE.BAD_REQUEST,
    );
  }

  return await persoon.getFractie(id, bestuursperiodeId);
}

export async function putPersonInRightGraph(
  personId: string,
  orgaanId: string,
): Promise<void> {
  const isValidPerson = await isValidId(RDF_TYPE.PERSON, personId);
  if (!isValidPerson) {
    throw new HttpError(
      `Person with id ${personId} not found.`,
      STATUS_CODE.BAD_REQUEST,
    );
  }
  const isValidOrgaan = await isValidId(RDF_TYPE.BESTUURSORGAAN, orgaanId);
  if (!isValidOrgaan) {
    throw new HttpError(
      `Organ with id ${orgaanId} not found.`,
      STATUS_CODE.BAD_REQUEST,
    );
  }

  const personShouldBeCopied = await shouldPersonBeCopied(personId, orgaanId);
  if (!personShouldBeCopied) {
    return;
  }

  const destinationGraph = await getDestinationGraphPerson(personId, orgaanId);
  if (!destinationGraph) {
    throw new HttpError(
      'Could not find a target graph to copy the person to.',
      STATUS_CODE.BAD_REQUEST,
    );
  }

  await copyPersonToGraph(personId, destinationGraph);
}

export async function checkFractie(
  personId: string,
  bestuursperiodeId: string,
  fractieId: string,
) {
  const isValidPerson = await isValidId(RDF_TYPE.PERSON, personId);
  if (!isValidPerson) {
    throw new HttpError(
      `Person with id ${personId} not found.`,
      STATUS_CODE.BAD_REQUEST,
    );
  }
  const isValidFractie = await isValidId(RDF_TYPE.FRACTIE, fractieId);
  if (!isValidFractie) {
    throw new HttpError(
      `Fractie with id ${fractieId} not found.`,
      STATUS_CODE.BAD_REQUEST,
    );
  }
  const isValidBestuursperiode = await isValidId(
    RDF_TYPE.BESTUURSPERIODE,
    bestuursperiodeId,
  );
  if (!isValidBestuursperiode) {
    throw new HttpError(
      `Bestuursperiode with id ${bestuursperiodeId} not found.`,
      STATUS_CODE.BAD_REQUEST,
    );
  }

  return checkFractieQuery(personId, bestuursperiodeId, fractieId);
}
