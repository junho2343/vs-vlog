import React, { useContext, useState } from "react";
import styled from "styled-components";
import { HiOutlineDocument } from "react-icons/hi";
import { AiOutlineSearch } from "react-icons/ai";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import Accordion from "../components/Accordion";
import Content from "../components/Content";
import AppContext from "../context/AppContext";
import { getPostOne } from "../common/common.function";
import PostWrap from "../components/PostWrap";
import Search from "./Search";

function Main() {
  const [selected, setSelected] = useState(null);
  const {
    theme,
    setTheme,
    setSelectedPost,
    selectedPost,
    postData,
    setOpenPost,
    openPost,
    selectedTag,
    setSelectedTag,
  } = useContext(AppContext);

  const listArr = [
    {
      icon: <HiOutlineDocument size={24} />,
      path: "EXPLORER",
      content: (
        <>
          <Accordion title="OPEN POSTS" isBold={true} initialExpanded={true}>
            {openPost.map((one, index) => {
              const data = getPostOne(postData, one);

              return (
                <PostWrap
                  path={data.path}
                  title={data.title}
                  isClose={true}
                  key={index}
                />
              );
            })}
          </Accordion>
          <Accordion title="VSCODE" isBold={true} initialExpanded={true}>
            {postData.map((one, index) => (
              <Content {...one} key={index} />
            ))}
          </Accordion>
        </>
      ),
    },
    {
      icon: <AiOutlineSearch size={24} />,
      path: "SEARCH",
      content: <Search />,
    },
  ];

  const data = getPostOne(postData, selectedPost);

  return (
    <Wrap>
      <LeftBar>
        <div>
          {listArr.map((one, index) => (
            <IconWrap
              selected={selected === index}
              onClick={() => {
                setSelected(selected === index ? null : index);
              }}
              key={index}
            >
              {one.icon}
            </IconWrap>
          ))}
        </div>

        <div>
          <div
            className={theme}
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
            }}
          />
        </div>
      </LeftBar>

      {selected !== null && listArr[selected] && (
        <LeftContent>
          <p>{listArr[selected].path}</p>
          {listArr[selected].content}
        </LeftContent>
      )}

      <RightWrap selected={selected}>
        {selectedTag ? (
          <RightTagContent>
            <div>
              <h2>
                {selectedTag.tagTitle} 관련 글 목록{" "}
                <span>({selectedTag.path.length} 개)</span>
              </h2>
              <div>
                {selectedTag.path.map((path) => {
                  const tagData = getPostOne(postData, path);

                  console.log(tagData);
                  return (
                    <div
                      className="post"
                      onClick={() => {
                        setSelectedPost(tagData.path);
                        setSelectedTag(null);

                        if (!openPost.includes(path)) {
                          setOpenPost([...openPost, path]);
                        }
                      }}
                    >
                      <div>
                        <div>
                          <img src={tagData.data.thumbnail} alt="" />
                        </div>
                        <h3>{tagData.title}</h3>
                      </div>
                      <div>
                        {tagData.data.tag.map((one) => (
                          <span>{one}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </RightTagContent>
        ) : (
          <>
            <RightHeader visible={openPost.length !== 0 ? true : false}>
              {openPost.map((one, index) => {
                const data = getPostOne(postData, one);

                return (
                  <div
                    className={selectedPost === one ? "selected" : ""}
                    onClick={() => {
                      setSelectedPost(data.path);
                    }}
                    key={index}
                  >
                    📝 {data.title}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();

                        const openPostFilter = openPost.filter(
                          (one) => one !== data.path
                        );
                        setOpenPost(openPostFilter);

                        setSelectedPost(
                          openPostFilter.length !== 0 ? openPostFilter[0] : null
                        );
                      }}
                    >
                      &#215;
                    </span>
                  </div>
                );
              })}
            </RightHeader>
            <RightContent
              selected={selected}
              visible={openPost.length !== 0 ? true : false}
            >
              {data && (
                <>
                  <p>{data.path}</p>
                  <div>
                    <h1>{data.title}</h1>
                    <p>
                      <strong>Junho</strong> | {data.data?.date}
                    </p>
                    <div>
                      {data.data?.tag?.map((one, index) => (
                        <span key={index}>{one}</span>
                      ))}
                    </div>
                    <div className="markdown">
                      <ReactMarkdown
                        children={data.data?.content}
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            return !inline && match ? (
                              <SyntaxHighlighter
                                children={String(children).replace(/\n$/, "")}
                                style={atomDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              />
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </RightContent>
          </>
        )}
      </RightWrap>
    </Wrap>
  );
}

export default Main;

const RightWrap = styled.div`
  width: ${({ selected }) =>
    selected === null ? "calc(100% - 50px)" : "calc(100% - 320px - 50px)"};

  @media (max-width: 540px) {
    display: ${({ selected }) => (selected === null ? "block" : "none")};
  }
`;

const RightHeader = styled.div`
  width: 100%;
  height: 50px;
  display: ${({ visible }) => (visible ? "flex" : "none")};
  overflow-x: scroll;
  background-color: ${({ theme }) => theme.color.secondary};

  ::-webkit-scrollbar-thumb {
    display: none;
  }

  &:hover::-webkit-scrollbar-thumb {
    display: block;
  }

  > div {
    width: 150px;
    min-width: 150px;
    padding: 10px;
    background-color: ${({ theme }) => theme.color.secondary};
    position: relative;
    cursor: pointer;

    &.selected {
      background-color: ${({ theme }) => theme.color.primary};
    }

    &:not(.selected) > span {
      display: none;
    }

    &:hover > span {
      display: block;
    }

    > span {
      position: absolute;
      right: 15px;
      top: 10px;
    }
  }
`;

const RightTagContent = styled.div`
  width: 100%;

  height: 100%;
  background-color: ${({ theme }) => theme.color.primary};
  padding: 10px 20px;

  display: flex;
  flex-direction: column;
  align-items: center;

  overflow-y: scroll;

  > div {
    width: 100%;
    max-width: 600px;
    > h2 {
      border-bottom: 1px solid #505050;
      padding: 30px 0 10px 0;
      > span {
        font-size: 1.2rem;
        color: ${({ theme }) => theme.color.selected};
      }
    }

    > div {
      > div.post {
        padding: 10px;
        margin-top: 20px;
        border-radius: 10px;
        background: ${({ theme }) => theme.color.secondary};
        cursor: pointer;

        &:hover {
          background: ${({ theme }) => theme.color.third};
          transform: scale(1.05);
          transition: 0.2s;
        }

        > div:first-child {
          display: flex;
          > div {
            width: 80px;
            height: 80px;
            background-color: red;
            border-radius: 10px;

            overflow: hidden;

            > img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
          > h3 {
            padding-left: 10px;
          }
        }
        > div:last-child {
          padding-top: 10px;
          > span {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 10px;
            margin-right: 10px;
            background-color: ${({ theme }) => theme.color.selected};
          }
        }
      }
    }
  }
`;

const RightContent = styled.div`
  width: 100%;
  height: ${({ visible }) => (visible ? "calc(100% - 50px)" : "100%")};
  background-color: ${({ theme }) => theme.color.primary};
  padding: 10px 20px;

  display: flex;
  flex-direction: column;
  align-items: center;

  overflow-y: scroll;

  > p {
    width: 100%;
    color: #7a7a7a;
  }

  > div {
    width: 100%;
    max-width: 600px;
    > h1 {
      padding: 30px 0 10px 0;
    }

    > p {
      padding-bottom: 20px;
      margin-bottom: 10px;
      color: #7a7a7a;
      border-bottom: 1px solid ${({ theme }) => theme.color.selected};
    }

    > div:nth-child(3) {
      padding: 10px 0 20px 0;
      > span {
        padding: 5px 10px;
        margin-right: 10px;
        border-radius: 10px;
        background-color: ${({ theme }) => theme.color.selected};
      }
    }

    > div:last-child.markdown {
      h1,
      h2,
      h3 {
        margin: 0.6em 0;
      }

      p {
        margin: 0.6em 0;
      }

      /* code {
        padding: 20px;
      } */
    }
  }
`;

const IconWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 0;
  cursor: pointer;

  border-left: ${({ theme, selected }) =>
    `${selected ? 2 : 0}px solid ${theme.color.text}`};

  > svg {
    color: ${({ theme, selected }) =>
      selected ? theme.color.text : "#7a7a7a"};
  }
`;

const Wrap = styled.div`
  display: flex;
  height: 100vh;
`;

const LeftBar = styled.div`
  width: 50px;
  min-width: 50px;
  height: 100%;
  background-color: ${({ theme }) => theme.color.third};

  display: flex;
  justify-content: space-between;
  flex-direction: column;

  > div:last-child {
    padding-bottom: 30px;
    display: flex;
    align-items: center;
    flex-direction: column;

    > div {
      height: 50px;
      width: 30px;
      /* background: ${({ theme }) => theme.color.primary}; */
      background: red;
      border-radius: 50px;
      position: relative;
      cursor: pointer;

      &::after {
        content: "";
        position: absolute;
        top: 6px;
        left: 5px;
        width: 20px;
        height: 20px;
        border-radius: 20px;
        /* background-color: ${({ theme }) => theme.color.selected}; */
        background-color: orange;
        transition: 0.3s;
      }
      &.light::after {
        top: 25px;
      }
    }
  }
`;

const LeftContent = styled.div`
  width: 320px;
  min-width: 320px;
  height: 100%;
  background-color: ${({ theme }) => theme.color.secondary};
  padding: 10px;

  > p {
    padding-bottom: 10px;
    color: #7a7a7a;
  }

  @media (max-width: 540px) {
    width: 100%;
  }
`;
