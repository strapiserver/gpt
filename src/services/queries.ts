import { gql } from "graphql-request";

export const AuthMutation = gql`
  mutation login {
    login(
      input: {
        identifier: "gpt"
        password: "SUJ#vq2x#@TH4L-"
        provider: "local"
      }
    ) {
      jwt
      user {
        username
        email
      }
    }
  }
`;

export const PromptsQuery = gql`
  {
    prompts {
      data {
        id
        attributes {
          code
          description
        }
      }
    }
  }
`;

export const CreateArticle = gql`
  mutation CrateArticle(
    $header: String
    $subheader: String
    $code: String
    $chapters: JSON
    $stats: JSON
    $locale: I18NLocaleCode
  ) {
    createArticle(
      data: {
        header: $header
        subheader: $subheader
        code: $code
        stats: $stats
        chapters: $chapters
      }
      locale: $locale
    ) {
      data {
        id
      }
    }
  }
`;

export const PmGroupsQuery = gql`
  {
    selector {
      data {
        attributes {
          sections {
            en_title
            ru_title
            pm_groups(pagination: { start: 0, limit: 1000 }) {
              data {
                attributes {
                  en_name
                  ru_name
                  prefix
                  options {
                    ... on ComponentSelectorSubgroup {
                      code
                      name
                      alternative_codes
                    }
                    ... on ComponentSelectorCurrency {
                      currency {
                        data {
                          attributes {
                            code
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const LinksQuery = gql`
  {
    exchangers(
      pagination: { limit: 1000 } # filters: { ru_description: { notNull: false } }
    ) {
      data {
        id
        attributes {
          name
          rates_link
          ref_link
        }
      }
    }
  }
`;

export const UpdateRefLinks = gql`
  mutation UpdateExchanger($id: ID!, $ref_link: String) {
    updateExchanger(id: $id, data: { ref_link: $ref_link }) {
      data {
        id
      }
    }
  }
`;

export const DeleteExchanger = gql`
  mutation DeleteExchanger($id: ID!) {
    deleteExchanger(id: $id) {
      data {
        id
      }
    }
  }
`;

export const UpdateDescriptions = gql`
  mutation UpdateExchanger(
    $id: ID!
    $ru_description: String
    $en_description: String
    $telegram: String
    $email: String
    $working_time: String
    $admin_rating: Float
  ) {
    updateExchanger(
      id: $id
      data: {
        en_description: $en_description
        ru_description: $ru_description
        telegram: $telegram
        email: $email
        working_time: $working_time
        admin_rating: $admin_rating
      }
    ) {
      data {
        id
      }
    }
  }
`;

export const CreateExchangerBC = gql`
  mutation createExchangerBC(
    $name: String
    $status: ENUM_EXCHANGER_STATUS
    $rates_link: String
    $ref_link: String
    $admin_rating: Float
    $bc_card_link: String
  ) {
    createExchanger(
      data: {
        name: $name
        status: $status
        rates_link: $rates_link
        ref_link: $ref_link
        admin_rating: $admin_rating
        exchanger_card: { bc_card_link: $bc_card_link }
      }
    ) {
      data {
        id
      }
    }
  }
`;
