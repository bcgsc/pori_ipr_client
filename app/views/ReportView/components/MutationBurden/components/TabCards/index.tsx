import React, { useState, useCallback } from 'react';
import {
  Typography,
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardContent,
} from '@material-ui/core';

import { imageType, comparatorType, mutationBurdenType } from '../../types';

import Image from '../../../../../../components/Image';

const rankMapping = {
  primary: 0,
  secondary: 1,
  tertiary: 2,
  quaternary: 3,
};

type TabCardsProps = {
  comparators: comparatorType[];
  mutationBurden: mutationBurdenType[];
  type: string;
  barplots: imageType[];
  densities: imageType[];
  legends: imageType[];
};

const TabCards = ({
  comparators,
  mutationBurden,
  type,
  barplots,
  densities,
  legends,
}: TabCardsProps): JSX.Element => {
  const [tabValue, setTabValue] = useState<number>(0);

  const handleTabChange = (event, value: number): void => {
    setTabValue(value);
  };

  const getImages = (imageGroup, role) => {
    const foundImages = [];

    imageGroup.forEach((img) => {
      const imgRole = img.key.split('.')[2] || '';
      if (role.toLowerCase() === imgRole.toLowerCase()) {
        foundImages.push(img);
      }
    });
    return foundImages;
  };

  const getTabs = useCallback(() => {
    const tabNames = [];

    return comparators
      .filter(({ analysisRole }) => analysisRole.includes('mutation burden'))
      .map(({ analysisRole }) => {
        const [roleName] = analysisRole.match(/(?<=\().+(?=\))/g);
        if (!tabNames.includes(roleName)) {
          tabNames.push(roleName);

          return (
            <Tab key={analysisRole} label={roleName} />
          );
        }
        return null;
      });
  }, [comparators]);

  const getCardContent = useCallback((burden) => {
    switch (type) {
      case 'SNV':
        return (
          <>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              Protein Coding SNVs (count):
              {` ${burden.codingSnvCount}`}
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              Protein Coding SNVs (percentile):
              {` ${burden.codingSnvPercentile}`}
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              Truncating Protein Coding SNVs (count):
              {` ${burden.truncatingSnvCount}`}
            </Typography>
          </>
        );
      case 'Indel':
        return (
          <>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              Protein Coding Indels (count):
              {` ${burden.codingIndelsCount}`}
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              Protein Coding Indels (percentile):
              {` ${burden.codingIndelPercentile}`}
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              Frameshifting Protein Coding Indels (count):
              {` ${burden.frameshiftIndelsCount}`}
            </Typography>
          </>
        );
      case 'SV':
        return (
          <>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              Structural Variants (count):
              {` ${burden.qualitySvCount}`}
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              Structural Variants (percentile):
              {` ${burden.qualitySvPercentile}`}
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              Expressed Structural Variants (count):
              {` ${burden.qualitySvExpressedCount}`}
            </Typography>
          </>
        );
      default:
        console.error(`Bad card type found: ${type}`);
        return null;
    }
  }, [type]);

  return (
    <>
      <div className="mutation-burden__tab-control">
        <Tabs value={tabValue} onChange={(event, value) => handleTabChange(event, value)}>
          {getTabs()}
        </Tabs>
      </div>
      <div className="mutation-burden__images">
        {comparators
          .filter(({ analysisRole }) => analysisRole.includes('mutation burden'))
          .map(({ analysisRole, name }) => {
            if (type === 'SV'
              && comparators.some(({ analysisRole: role }) => role.includes('mutation burden SV'))
              && !analysisRole.includes('mutation burden SV')) {
              return null;
            }

            if (type !== 'SV'
              && analysisRole.includes('mutation burden SV')) {
              return null;
            }

            const [roleName] = analysisRole.match(/(?<=\().+(?=\))/g);
            const mutationBurdenRole = mutationBurden.find(({ role }) => role === roleName);

            const barplotsByRole = getImages(barplots, roleName);
            const densitiesByRole = getImages(densities, roleName);
            const legendsByRole = getImages(legends, roleName);

            return (
              <React.Fragment key={analysisRole}>
                {rankMapping[roleName] === tabValue && (
                  <Card key={name} elevation={3} className="mutation-burden__group">
                    <CardHeader title={`Comparator: ${name} (${roleName})`} />
                    {Boolean(barplotsByRole.length) && barplotsByRole.map(plot => (
                      <span key={plot.key} className="mutation-burden__image">
                        <Image
                          image={plot}
                          showTitle
                          showCaption
                        />
                      </span>
                    ))}
                    {Boolean(densitiesByRole.length) && densitiesByRole.map((plot, index) => (
                      <span key={plot.key} className="mutation-burden__pair">
                        <Typography>{plot.title}</Typography>
                        <Image image={plot} />
                        {legendsByRole[index] && (
                          <Image image={legendsByRole[index]} />
                        )}
                        <Typography>{plot.caption}</Typography>
                      </span>
                    ))}
                    {mutationBurdenRole && (
                      <CardContent>
                        {getCardContent(mutationBurdenRole)}
                      </CardContent>
                    )}
                  </Card>
                )}
              </React.Fragment>
            );
          })}
      </div>
    </>
  );
};

export default TabCards;
