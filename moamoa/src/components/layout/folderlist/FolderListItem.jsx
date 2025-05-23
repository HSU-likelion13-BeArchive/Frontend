import React, { useRef, useState, useEffect } from "react";
import "./FolderList.scss";
import Dialog from "../../common/dialog/Dialog";
import useEditableInput from "../../../hooks/useEditableInput";
import useDialog from "../../../hooks/useDialog";
import { isDuplicateFolderName } from "../../../utils/validation";
import { GoPencil } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { TbTrash } from "react-icons/tb";

const FolderListItem = ({
  id,
  name,
  isEditing,
  onStartEdit,
  onStopEdit,
  onRequestDelete,
  onRename,
  folderNames,
}) => {
  const { inputValue, setInputValue, originalValue, isModified, commitValue } =
    useEditableInput(name);

  const { showDialog } = useDialog(); // 중복 경고창
  const ref = useRef(null);
  const [clickState, setClickState] = useState(null);

  // 중복 여부 체크
  const isDuplicate = isDuplicateFolderName(
    inputValue,
    originalValue,
    folderNames
  );

  // 외부 클릭 시 상태 초기화
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setClickState(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 클릭 상태 처리 (단일/더블 클릭)
  let clickTimeout = useRef(null);
  const handleClick = () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      setClickState("double");
    } else {
      clickTimeout.current = setTimeout(() => {
        setClickState("single");
        clickTimeout.current = null;
      }, 250);
    }
  };

  // 이름 수정
  const handleSave = () => {
    // 비어있는 경우
    if (inputValue.trim() === "") return;
    // 중복된 경우
    if (isDuplicate) {
      showDialog({
        title: "폴더 생성 중복",
        message: "기존의 폴더명과 중복되어 생성이 불가능합니다.",
        subMessage: "폴더명을 변경해 주세요.",
        confirmText: "확인",
      });

      return;
    }
    commitValue(inputValue); // 저장된 이름 갱신
    onRename(id, inputValue); // 상태에 반영 (UI 갱신용)
    onStopEdit();
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`folder-item
        ${isEditing ? "folder-item--editing" : ""}
        ${clickState === "single" ? "folder-item--clicked" : ""}
        ${clickState === "double" ? "folder-item--double-clicked" : ""}
        ${
          (clickState === "single" || clickState === "double") && !isEditing
            ? "folder-item--hidden-icons"
            : ""
        }
      `}
    >
      {isEditing ? (
        <div className="folder-item__edit-wrapper">
          <input
            className="folder-item__input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <div className="folder-item__icons">
            <IoCheckmark
              className={`folder-item__icon folder-item__icon--confirm ${
                isModified ? "active" : ""
              }`}
              onClick={handleSave}
            />
            <TbTrash
              className="folder-item__icon folder-item__icon--cancel"
              onClick={onRequestDelete}
            />
          </div>
        </div>
      ) : (
        <>
          <span className="folder-item__name">{originalValue}</span>
          <GoPencil className="folder-item__icon" onClick={onStartEdit} />
        </>
      )}
    </div>
  );
};

export default FolderListItem;
